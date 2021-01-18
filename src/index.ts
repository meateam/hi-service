import apm from "elastic-apm-node";
import menash from "menashmq";
import Server from "./server";
import config from "./config";
import { driver } from "@rocket.chat/sdk";
import express from "express";

const { service, apmConfig, rabbitmq, hi } = config;

const initRabbitmq = async () => {
    try {
        console.log("Attempt connection to RabbitMQ");
        await menash.connect(rabbitmq.url);
        console.log("Connected to RabbitMQ");
    } catch (err) {
        console.error("Could not connect to RabbitMQ");
        console.error(err);
    }
};

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
        console.error(err);
    }
};

const initHealthcheck = async () => {
    const app = express();
    app.get(
        ["/api", "/api/isalive", "/api/IsAlive", "/api/healthcheck"],
        (req, res) => {
            res.send(`Service is up`);
        }
    );

    app.listen(service.port, () => console.log("Health check is up"));
};

const main = async () => {
    apm.start({
        serviceName: service.name,
        secretToken: apmConfig.secretToken,
        verifyServerCert: apmConfig.verifyServerCert,
        serverUrl: apmConfig.apmURL,
    });

    await Promise.all([initRabbitmq(), initHIConnection(), initHealthcheck()]);

    const hiServer: Server = new Server();
    await hiServer.initializeConsumer(rabbitmq.queue);
    await hiServer.activateConsumer();

    console.log(`Server is up.`);
};

main().catch(console.error);
