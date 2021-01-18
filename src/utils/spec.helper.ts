import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
    // application specific logging, throwing an error, or other logic here
});

before(async () => {
});

after((done) => {
});
