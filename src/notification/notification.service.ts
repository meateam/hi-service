import UsersClient from "src/utils/users.client";
import { IUser, EXTERNAL_DESTS } from "src/utils/users.interface";
import { driver } from "@rocket.chat/sdk";
import { ServerError, UserNotFoundError } from "../utils/error";
import { log, Severity } from "../utils/logger";
import { IMessageReceiptAPI } from "@rocket.chat/sdk/dist/utils/interfaces";
import { Types } from "mongoose";

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
        const destination: string | undefined = !this.isValidObjectId(
            senderUserID
        )
            ? String(EXTERNAL_DESTS.TOMCAL)
            : undefined;

        const [senderUser, reciverUser]: [IUser, IUser] = await Promise.all([
            UsersClient.getUserByID(senderUserID, destination),
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
        const reciverUserTs = this.extractUserTs(reciverUser);

        await Promise.all(
            reciverUserTs.map((userT) =>
                driver
                    .sendDirectToUser(msg, userT)
                    .then(
                        (
                            hiResponse:
                                | IMessageReceiptAPI
                                | IMessageReceiptAPI[]
                        ) =>
                            log(
                                Severity.INFO,
                                Array.isArray(hiResponse)
                                    ? hiResponse[0].msg
                                    : hiResponse.msg,
                                "sendSharedFileNotification",
                                undefined,
                                hiResponse
                            )
                    )
            )
        );
    }

    /**
     * A function that accepts kartofel user and returns all of its
     * adfsIds from the 'domainUsers'.
     * @param user kartofel user
     * @returns list of adfsIds
     */
    private static extractUserTs(user: IUser): string[] {
        const userTs: string[] = user.domainUsers
            .map((domainUser) => domainUser.adfsUID)
            .filter((adfsUID) => adfsUID) as string[];
        if (!userTs) {
            throw new ServerError(
                `Could not find the user T for user with id: ${user.id}`
            );
        }
        return userTs;
    }

    /**
     * A function that checks if a string is a mongodb ObjectId.
     * @param id string that will be checked
     * @returns true or false if the ID is a mongodb ObjectId
     */
    private static isValidObjectId(id: string) {
        return (
            Types.ObjectId.isValid(id) && String(new Types.ObjectId(id)) === id
        );
    }
}
