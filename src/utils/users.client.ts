import grpc from "grpc";
import config from "../config";
import { loadSync } from "@grpc/proto-loader";
import { IUser } from "./users.interface";

const PROTO_PATH = `${__dirname}/../../proto/users.proto`;
const packageDefinition = loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const { users }: any = grpc.loadPackageDefinition(packageDefinition);

export default class UsersClient {
    static usersClient: any = null;
    /**
     * Initialize the grpc connection to the users service
     */
    public static async initUsersConnection(): Promise<void> {
        this.usersClient = await new users.Users(
            config.usersService.url,
            grpc.credentials.createInsecure()
        );
    }

    /**
     * Handles the GetUserByID request to the users service and returns a user.
     * @param id the user ID
     */
    public static async getUserByID(id: string): Promise<IUser> {
        return new Promise((res, rej) => {
            if (!this.usersClient) {
                rej("Users grpc client was not initialized.");
            }
            this.usersClient.GetUserByID(
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
}
