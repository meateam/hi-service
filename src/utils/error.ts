/**
 * This file contains extended errors for the application.
 */

export class ApplicationError extends Error {
    public code: number;

    constructor(message?: string, code?: number) {
        super();

        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message || "unknown application error";
        this.code = code || 500;
    }
}

export class ServerError extends ApplicationError {
    constructor(message?: string, code?: number) {
        super(message || "server side error", code || 500);
    }
}

export class UserNotFoundError extends ServerError {
    constructor(userState: string, failedUserID: string) {
        super(`Could not find ${userState} user with id: ${failedUserID}`);
    }
}

export class ClientError extends ApplicationError {
    constructor(message?: string, code?: number) {
        super(
            message || "client side error",
            code || 400
        );
    }
}
