import grpc from "grpc";
import config from "../config";
import { loadSync } from "@grpc/proto-loader";
import { IUser } from "src/utils/users.interface";
import { driver } from "@rocket.chat/sdk";
import { ServerError } from "../utils/error";
import { log, Severity } from "../utils/logger";
import { IMessageReceiptAPI } from "@rocket.chat/sdk/dist/utils/interfaces";


const PROTO_PATH = `${__dirname}/../../proto/users.proto`;
const packageDefinition = loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const { users }: any = grpc.loadPackageDefinition(packageDefinition);

async function getUserByID(id: string): Promise<IUser> {
    const usersClient = await new users.Users(
        config.usersService.url,
        grpc.credentials.createInsecure()
    );

    return new Promise((res, rej) => {
        usersClient.GetUserByID(
            {
                id,
            },
            (err: Error, response: any) => {
                if (err) {
                    rej(err);
                }
                res(response);
            }
        );
    });
}

export default class NotificationService {
    static async sendNotification(
        senderUserID: string,
        reciverUserID: string
    ): Promise<void> {
        try {
            const [senderUser, reciverUser]: [
                IUser,
                IUser
            ] = await Promise.all([
                getUserByID(senderUserID),
                getUserByID(reciverUserID),
            ]);

            if (!senderUser) {
                throw new ServerError(
                    `Could not find sender user with id: ${senderUserID}`
                );
            } else if (!reciverUser) {
                throw new ServerError(
                    `Could not find reciver user with id: ${reciverUserID}`
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
        } catch (err) {
            log(
                Severity.ERROR,
                err.message,
                config.service.name,
                undefined,
                err
            );
            throw new ServerError(err.message);
        }
    }
}
