import apm from "elastic-apm-node";
import menash from "menashmq";
import Server from "./server";
import config from "./config";
import { driver } from "@rocket.chat/sdk";
import express from "express";
import { ServerError } from "./utils/error";

const { service, apmConfig, rabbitmq, hi } = config;

/**
 * Initialize the rabbitmq connection
 */
const initRabbitmq = async () => {
    try {
        console.log("Attempt connection to RabbitMQ");
        await menash.connect(rabbitmq.url);
        console.log("Connected to RabbitMQ");
    } catch (err) {
        console.error("Could not connect to RabbitMQ");
        throw new ServerError(err);
    }
};

/**
 * Initialize the connection to the HI and login.
 */
const initHIConnection = async () => {
    try {
        console.log("Attempt connection to HI servers");
        await driver.connect({ host: hi.chatUrl, useSsl: hi.ssl });
        console.log("Connected to HI servers");
        await driver.login({
            username: hi.loginUser,
            password: hi.loginPass,
        });
        console.log("Logged in to HI servers");
    } catch (err) {
        console.error("Could not connect to HI servers");
        throw new ServerError(err);
    }
};

/**
 * Initialize express server for healthcheck
 */
const initHealthcheck = async () => {
    return new Promise((res, rej) => {
        const app = express();
        app.get(
            ["/api", "/api/isalive", "/api/IsAlive", "/api/healthcheck"],
            (req, res) => {
                res.send(`Service is up`);
            }
        );

        app.listen(service.port, () => res("Health check is up"));
    }).then(console.log);
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
        console.log(`Server is up.`);
    } catch (err) {
        console.error(err);
    }
};

main();
