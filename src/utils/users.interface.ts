export interface IOrganizationGroup {
    id?: string;
    name: string;
    directManagers?: IUser[] | string[];
    directMembers?: IUser[] | string[];
    createdAt: Date;
    updatedAt?: Date;
    ancestors?: string[];
    children?: IOrganizationGroup[] | string[];
    hierarchy?: string[];
    isALeaf?: boolean;
    isAlive?: boolean;
}

export interface IDomainUser {
    id?: string;
    domain?: string;
    name?: string;
    uniqueID?: string;
    adfsUID?: string;
    personId?: string | IUser;
}

export interface IUser {
    // Person's Basic information
    _id?:string;
    id: string;
    identityCard: string;
    personalNumber?: string;
    domainUsers: IDomainUser[];
    entityType: string;
    serviceType?: string;
    firstName: string;
    lastName: string;
    currentUnit?: string;
    alive?: boolean;
    dischargeDay?: Date;
    hierarchy: string[];
    hierarchyFlat?: string;
    directGroup: string | IOrganizationGroup;
    managedGroup?: string | IOrganizationGroup;
    rank?: string;
    updatedAt?: Date;
    createdAt?: Date;
    // Editable by the Person
    job: string;
    mail?: string;
    phone?: string[];
    mobilePhone?: string[];
    address?: string;
    // Editable with strong permissions
    responsibility?: string;
    responsibilityLocation?: string | IOrganizationGroup;
    clearance?: string;
    // Calculated
    fullName?: string;
    adfsId: string;
}