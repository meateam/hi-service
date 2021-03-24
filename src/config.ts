import * as env from "env-var";
import * as dotenv from "dotenv";

const dotenvPath = process.env.LOAD_DEV_DOTENV ? ".env.dev" : ".env";

dotenv.config({ path: dotenvPath });

const esHost = env
    .get("ELASTICSEARCH_URL")
    .default("http://localhost:9200")
    .asArray(",");
const esUser = env.get("ELASTICSEARCH_USER").default("");
const esPass = env.get("ELASTICSEARCH_PASSWORD").default("");

const config = {
    service: {
        name: env
            .get("HIS_SERVICE_NAME")
            .default("hi-service")
            .asString(),
        port: env.get("HIS_PORT").default('8080').asString(),
    },
    usersService: {
        url: env.get("USERS_SERVICE_URL").default('user-service:8080').asString(),
    },
    hi: {
        chatUrl: env
            .get("HIS_HI_URL")
            .default("http://rocketchat:3000")
            .asUrlString(),
        chatLoginUrl: env.get("HIS_HI_LOGIN").default("login").asString(),
        chatMessageUrl: env.get("HIS_HI_MESSAGE").default("chat").asString(),
        loginUser: env.get("HIS_HI_USER").default('admin').asString(),
        loginPass: env.get("HIS_HI_PASS").default('admin').asString(),
        ssl: env.get("HIS_HI_SSL").default("true").asBool(),
    },
    rabbitmq: {
        url: env.get("HIS_RABBITMQ_URL").default("amqp://localhost").asString(),
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
