import config from "./config";
import NotificationController from "./notification/notification.controller";
import menash, { ConsumerMessage } from "menashmq";
import { log, Severity } from "./utils/logger";
import { ServerError } from "./utils/error";
import { IPermission } from "./utils/permission.inteface";

export default class Consumer {
    public queue: string | undefined;

    public async initializeConsumer(queue: string) {
        await menash.declareQueue(queue);
        this.queue = queue;
    }

    public async activateConsumer() {
        if (this.queue) {
            await menash.queue(this.queue).activateConsumer(
                async (msg: ConsumerMessage) => {
                    const permission = msg.getContent() as IPermission;
                    console.log(permission);
                    console.log(permission.Creator);
                    
                    log(
                        Severity.INFO,
                        "Consumed message",
                        config.service.name,
                        undefined,
                        permission
                    );
                    await NotificationController.notify(permission);

                    msg.ack();
                },
                { noAck: false }
            );
        } else {
            throw new ServerError();
        }
    }
}
