import * as winston from "winston";
import * as os from "os";
import * as WinstonElasticsearch from "winston-elasticsearch";
import Config from "../config";

const indexTemplateMapping = require("winston-elasticsearch/index-template-mapping.json");
const Elasticsearch = require("winston-elasticsearch");

const { confLogger, service, debugMode } = Config;

// index pattern for the logger
const indexPattern = `${confLogger.indexPrefix}-*`;

export const logger: winston.Logger = winston.createLogger({
    defaultMeta: { service: service.name, hostname: os.hostname() },
});

// configure logger
const options: WinstonElasticsearch.ElasticsearchTransportOptions = {
    indexPrefix: confLogger.indexPrefix,
    level: "verbose",
    clientOpts: confLogger.options,
    bufferLimit: 100,
    messageType: "log",
    ensureMappingTemplate: true,
    mappingTemplate: { ...indexTemplateMapping, index_patterns: indexPattern },
};
const elasticsearch: WinstonElasticsearch.default = new Elasticsearch(options);
logger.add(elasticsearch);

// Console logs for debugging only.
if (debugMode) {
    logger.add(new winston.transports.Console({}));
}

/**
 * logs the data with its given parameters.
 * @param severity - the kind of log created.
 * @param message - description in text.
 * @param name - name of the log. in our case, the function called.
 * @param traceID - id to correlate to if there are several logs with some connection.
 * @param meta - additional optional information.
 */
export const log = <T>(
    level: Severity,
    message: string,
    name: string,
    traceID?: string,
    meta?: T
) => {
    logger.log(level, message, { ...meta, traceID, method: name });
};

export enum Severity {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    VERBOSE = "verbose",
    DEBUG = "debug",
    SILLY = "silly",
}
