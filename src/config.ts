import * as env from "env-var";
import * as dotenv from "dotenv";

const dotenvPath = process.env.LOAD_DEV_DOTENV ? ".env.dev" : ".env";

dotenv.config({ path: dotenvPath });

// This env var is responsible for the elastic search url
const esHost = env
.get("ELASTICSEARCH_URL")
.default("http://localhost:9200")
.asArray(",");
// This env var is responsible for the elastic search user
const esUser = env.get("ELASTICSEARCH_USER").default("");
// This env var is responsible for the elastic search password
const esPass = env.get("ELASTICSEARCH_PASSWORD").default("");

const config = {
    service: {
        // This env var is responsible for the current service name
        name: env
        .get("HIS_SERVICE_NAME")
        .default("hi-service")
        .asString(),
        // This env var is responsible for the current service port
        port: env.get("HIS_PORT").default('8080').asString(),
    },
    usersService: {
        // This env var is responsible for the user service url
        url: env.get("USERS_SERVICE_URL").default('user-service:8080').asString(),
    },
    hi: {
        // This env var is responsible for the HI url
        chatUrl: env
        .get("HIS_HI_URL")
        .default("http://rocketchat:3000")
        .asUrlString(),
        // This env var is responsible for the HI username
        loginUser: env.get("HIS_HI_USER").default('admin').asString(),
        // This env var is responsible for the HI password
        loginPass: env.get("HIS_HI_PASS").default('admin').asString(),
        // This env var is responsible for the HI connection. If to use ssl connection.
        ssl: env.get("HIS_HI_SSL").default("true").asBool(),
    },
    rabbitmq: {
        // This env var is responsible for the rabbitmq url
        url: env.get("HIS_RABBITMQ_URL").default("amqp://localhost").asString(),
        // This env var is responsible for the rabbitmq queue name
        queue: env
        .get("HIS_RABBITMQ_QUEUE")
        .default("hiQueue")
        .asString(),
    },
    apmConfig: {
        secretToken: env.get("APM_SECRET_TOKEN").default("").asString(),
        verifyServerCert: env
        .get("ELASTIC_APM_VERIFY_SERVER_CERT")
        .default("false")
        .asBool(),
        apmURL: env
        .get("ELASTIC_APM_SERVER_URL")
        .default("http://localhost:8200")
        .asUrlString(),
    },
    elasticsearch: {
        esHost,
        esUser,
        esPass,
    },
    // This env var is responsible for the checking if the porject is in debug mode
    debugMode: env.get("DEBUG_MODE").default("false").asBool(),
    confLogger: {
        options: {
            hosts: esHost,
            // Might be auth instead, not sure.
            httpAuth: `${esUser}:${esPass}`,
        },
        indexPrefix: env.get("LOG_INDEX").default("kdrive").asString(),
    },
};

export default config;
