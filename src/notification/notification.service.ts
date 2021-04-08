import UsersClient from "src/utils/users.client";
import { IUser } from "src/utils/users.interface";
import { driver } from "@rocket.chat/sdk";
import { ServerError, UserNotFoundError } from "../utils/error";
import { log, Severity } from "../utils/logger";
import { IMessageReceiptAPI } from "@rocket.chat/sdk/dist/utils/interfaces";

export default class NotificationService {
    /**
     * Sends a message to the reciver in the HI that a file was shared with him.
     * @param senderUserID the sender user id
     * @param receiverUserID the reciver user id
     */
    static async sendSharedFileNotification(
        senderUserID: string,
        receiverUserID: string
    ): Promise<void> {
        const [senderUser, reciverUser]: [IUser, IUser] = await Promise.all([
            UsersClient.getUserByID(senderUserID),
            UsersClient.getUserByID(receiverUserID),
        ]);

        if (!senderUser && !reciverUser) {
            throw new UserNotFoundError(
                "sender and receiver",
                `sender: ${senderUserID} receiver: ${receiverUserID}`
            );
        } else if (!senderUser) {
            throw new UserNotFoundError("sender", senderUserID);
        } else if (!reciverUser) {
            throw new UserNotFoundError("reciver", receiverUserID);
        }

        const msg = `${senderUser.fullName} שיתף איתך קובץ.`;
        const reciverUserT = this.extractUserT(reciverUser);

        const hiResponse:
            | IMessageReceiptAPI
            | IMessageReceiptAPI[] = await driver.sendDirectToUser(
            msg,
            reciverUserT
        );

        log(
            Severity.INFO,
            Array.isArray(hiResponse) ? hiResponse[0].msg : hiResponse.msg,
            "sendSharedFileNotification",
            undefined,
            hiResponse
        );
    }

    private static extractUserT(user: IUser) {
        const userT = user.adfsId;
        if (!userT) {
            throw new ServerError(
                `Could not find the user T for user with id: ${user.id}`
            );
        }
        return userT;
    }
}
