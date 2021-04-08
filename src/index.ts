import apm from "elastic-apm-node";
import menash from "menashmq";
import Server from "./server";
import config from "./config";
import express from "express";
import { driver } from "@rocket.chat/sdk";
import { ServerError } from "./utils/error";
import { log, Severity } from "./utils/logger";

const { service, apmConfig, rabbitmq, hi } = config;

/**
 * Initialize the rabbitmq connection
 */
const initRabbitmq = async () => {
    try {
        log(Severity.INFO, "Attempt connection to RabbitMQ", 'initRabbitmq');
        await menash.connect(rabbitmq.url);
        log(Severity.INFO, "Connected to RabbitMQ", 'initRabbitmq');
    } catch (err) {
        log(Severity.ERROR, "Could not connect to RabbitMQ", 'initRabbitmq');
        throw new ServerError(err);
    }
};

/**
 * Initialize the connection to the HI and login.
 */
const initHIConnection = async () => {
    try {
        log(Severity.INFO, "Attempt connection to HI servers", 'initHIConnection');
        await driver.connect({ host: hi.chatUrl, useSsl: hi.ssl });
        log(Severity.INFO, "Connected to HI servers", 'initHIConnection');
        await driver.login({
            username: hi.loginUser,
            password: hi.loginPass,
        });
        log(Severity.INFO, "Logged in to HI servers", 'initHIConnection');
    } catch (err) {
        log(Severity.ERROR, "Could not connect to HI servers", 'initHIConnection');
        throw new ServerError(err);
    }
};

/**
 * Initialize express server for healthcheck
 */
const initHealthcheck = async () => {
    return new Promise<string>((resolve, reject) => {
        const app = express();
        app.get(
            ["/api", "/api/isalive", "/api/IsAlive", "/api/healthcheck"],
            (req, res) => {
                res.send(`Service is up`);
            }
        );

        app.listen(service.port, () => resolve("Health check is up"));
    })
    .then((healthCheckMsg: string) => log(Severity.INFO, healthCheckMsg, 'initHealthcheck'))
    .catch((err: Error) => log(Severity.INFO, err.message, 'initHealthcheck', undefined, err));
};

const initAPM = async () => {
    apm.start({
        serviceName: service.name,
        secretToken: apmConfig.secretToken,
        verifyServerCert: apmConfig.verifyServerCert,
        serverUrl: apmConfig.apmURL,
    });
};

const main = async () => {
    try {
        initAPM();
        await Promise.all([
            initRabbitmq(),
            initHIConnection(),
            initHealthcheck(),
        ]);

        const hiServer: Server = new Server();
        await hiServer.initializeConsumer(rabbitmq.queue);
        await hiServer.activateConsumer();
        log(Severity.INFO, "Server is up.", 'main');
    } catch (err) {
        log(Severity.ERROR, err.message, 'main', undefined, err);
    }
};

main();
