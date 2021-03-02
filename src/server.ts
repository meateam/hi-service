import NotificationController from "./notification/notification.controller";
import UsersClient from "./utils/users.client";
import menash, { ConsumerMessage } from "menashmq";
import { log, Severity } from "./utils/logger";
import { ServerError } from "./utils/error";
import { IPermission } from "./utils/permission.inteface";

export default class Server {
    public queue: string | undefined;

    /**
     * Initialize the consumer's pre requirements.
     * @param queue the queue that will be consumed from
     */
    public async initializeConsumer(queue: string) {
        // Declare a new queue that the consumer will consume from and
        // init the connection to the users service.
        await Promise.all([menash.declareQueue(queue), UsersClient.initUsersConnection()]);
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
                            "activateConsumer",
                            undefined,
                            permission
                        );

                        await NotificationController.notify(permission);
                    } catch (err) {
                        log(
                            Severity.ERROR,
                            err.message,
                            'activateConsumer',
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
            const errMsg = "queue is not defined";
            log(Severity.ERROR, errMsg, "activateConsumer", undefined, {
                queue: this.queue,
            });
            throw new ServerError(errMsg);
        }
    }
}
