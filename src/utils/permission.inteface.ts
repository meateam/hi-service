export interface IPermission {
    ID: string;
    FileID: string;
    UserID: string;
    Role: Role;
    Creator: string;
    AppID: string;
}

enum Role {
    NONE = 0,
    WRITE = 1,
    READ = 2,
}
