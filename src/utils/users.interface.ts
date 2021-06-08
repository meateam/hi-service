import { ctsDest, tomcalDest } from "../config";

export interface IDomainUser {
    id?: string;
    domain?: string;
    name?: string;
    uniqueID?: string;
    adfsUID?: string;
    personId?: string | IUser;
}

export interface IUser {
    id: string;
    fullName: string;
    firstName: string;
    lastName: string;
    hierarchy?: string[];
    hierarchyFlat: string;
    mail: string;
    domainUsers: IDomainUser[];
}

export enum EXTERNAL_DESTS {
    TOMCAL = tomcalDest as any,
    CTS = ctsDest as any,
}
