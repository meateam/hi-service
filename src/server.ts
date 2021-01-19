import config from "./config";
import NotificationController from "./notification/notification.controller";
import menash, { ConsumerMessage } from "menashmq";
import { log, Severity } from "./utils/logger";
import { ServerError } from "./utils/error";
import { IPermission } from "./utils/permission.inteface";
import { initUsersConnection } from "./utils/users.client";

export default class Consumer {
    public queue: string | undefined;

    /**
     * Initialize the consumer's pre requirements.
     * @param queue the queue that will be consumed from
     */
    public async initializeConsumer(queue: string) {
        // Declare a new queue that the consumer will consume from and
        // init the connection to the users service.
        await Promise.all([menash.declareQueue(queue), initUsersConnection()]);
        this.queue = queue;
    }

    /**
     * Consumes a queue and notify the reciver user in the HI.
     */
    public async activateConsumer() {
        if (this.queue) {
            await menash.queue(this.queue).activateConsumer(
                async (msg: ConsumerMessage) => {
                    try {
                        const permission = msg.getContent() as IPermission;

                        log(
                            Severity.INFO,
                            "Consumed message",
                            config.service.name,
                            undefined,
                            permission
                        );

                        await NotificationController.notify(permission);
                    } catch (err) {
                        log(
                            Severity.ERROR,
                            err.message,
                            config.service.name,
                            undefined,
                            err
                        );
                    } finally {
                        msg.ack();
                    }
                },
                { noAck: false }
            );
        } else {
            throw new ServerError();
        }
    }
}
