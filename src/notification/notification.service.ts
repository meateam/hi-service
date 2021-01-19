import config from "../config";
import { IUser } from "src/utils/users.interface";
import { driver } from "@rocket.chat/sdk";
import { ServerError } from "../utils/error";
import { log, Severity } from "../utils/logger";
import { IMessageReceiptAPI } from "@rocket.chat/sdk/dist/utils/interfaces";
import { getUserByID } from "src/utils/users.client";

export default class NotificationService {
    /**
     * Sends a message to the reciver in the HI that a file was shared with him.
     * @param senderUserID the sender user id
     * @param reciverUserID the reciver user id
     */
    static async sendSharedFileNotification(
        senderUserID: string,
        reciverUserID: string
    ): Promise<void> {
        const [senderUser, reciverUser]: [IUser, IUser] = await Promise.all([
            getUserByID(senderUserID),
            getUserByID(reciverUserID),
        ]);

        if (!senderUser || !reciverUser) {
            const isSenderUserFailed: boolean = !senderUser;
            const failedUserID: string = isSenderUserFailed
                ? senderUserID
                : reciverUserID;
            const userState: string = isSenderUserFailed ? "sender" : "reciver";
            throw new ServerError(
                `Could not find ${userState} user with id: ${failedUserID}`
            );
        }

        const msg = `${senderUser.firstName} ${senderUser.lastName} שיתף איתך קובץ.`;
        const reciverUserT = reciverUser.adfsId.split("@")[0];

        if (!reciverUserT) {
            throw new ServerError(
                `Could not find the user t for user with id: ${reciverUser.id}`
            );
        }

        const hiResponse:
            | IMessageReceiptAPI
            | IMessageReceiptAPI[] = await driver.sendDirectToUser(
            msg,
            reciverUser.adfsId
        );

        log(
            Severity.INFO,
            Array.isArray(hiResponse) ? hiResponse[0].msg : hiResponse.msg,
            config.service.name,
            undefined,
            hiResponse
        );
    }
}
