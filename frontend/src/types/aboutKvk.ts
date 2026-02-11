export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface Kvk {
    kvkId: number;
    kvkName: string;
    zoneId: number;
    stateId: number;
    districtId: number;
    orgId: number;
    hostOrg: string;
    mobile: string;
    email: string;
    address: string;
    yearOfSanction: number;
    zone?: { zoneId: number; zoneName: string };
    state?: { stateId: number; stateName: string };
    district?: { districtId: number; districtName: string };
    org?: { orgId: number; uniName: string };
}

export interface KvkBankAccount {
    bankAccountId: number;
    kvkId: number;
    accountType: 'KVK' | 'REVOLVING_FUND' | 'OTHER';
    accountName: string;
    bankName: string;
    location: string;
    accountNumber: string;
    createdAt?: string;
    updatedAt?: string;
    kvk?: { kvkId: number; kvkName: string };
}

export interface StaffTransferHistory {
    transferId: number;
    kvkStaffId: number;
    fromKvkId: number;
    toKvkId: number;
    transferredBy?: number;
    transferDate: string;
    transferReason?: string;
    notes?: string;
    isReversal: boolean;
    reversedTransferId?: number;
    createdAt: string;
    updatedAt: string;
    // Relations
    staff?: {
        kvkStaffId: number;
        staffName: string;
    };
    fromKvk?: {
        kvkId: number;
        kvkName: string;
    };
    toKvk?: {
        kvkId: number;
        kvkName: string;
    };
    transferredByUser?: {
        userId: number;
        name: string;
        email: string;
    };
}

export interface KvkEmployee {
    kvkStaffId: number;
    kvkId: number;
    staffName: string;
    email?: string;
    mobile: string;
    dateOfBirth: string; // DateTime
    photoPath?: string;
    resumePath?: string;
    sanctionedPostId: number;
    positionOrder: number;
    disciplineId: number;
    payScale?: string;
    payLevel?: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5' | 'LEVEL_6' | 'LEVEL_10' | 'LEVEL_10R' | 'LEVEL_11' | 'LEVEL_11R' | 'LEVEL_12' | 'LEVEL_12R' | 'LEVEL_13A' | 'LEVEL_14';
    dateOfJoining: string;
    jobType: 'PERMANENT' | 'TEMPORARY';
    allowances?: string;
    category: 'SC' | 'ST' | 'OBC' | 'GENERAL';
    transferStatus: 'ACTIVE' | 'TRANSFERRED';
    sourceKvkIds?: number[]; // Array of KVK IDs tracking transfer chain
    originalKvkId?: number;
    transferCount?: number;
    lastTransferDate?: string;
    kvk?: { kvkId: number; kvkName: string };
    sanctionedPost?: { sanctionedPostId: number; postName: string };
    discipline?: { disciplineId: number; disciplineName: string };
    originalKvk?: { kvkId: number; kvkName: string };
}

export interface KvkInfrastructure {
    infraId: number;
    kvkId: number;
    infraMasterId: number;
    notYetStarted: boolean;
    completedPlinthLevel: boolean;
    completedLintelLevel: boolean;
    completedRoofLevel: boolean;
    totallyCompleted: boolean;
    plinthAreaSqM: number;
    underUse: boolean;
    sourceOfFunding: string;
    createdAt?: string;
    updatedAt?: string;
    kvk?: { kvkId: number; kvkName: string };
    infraMaster?: { infraMasterId: number; name: string };
}

export interface KvkVehicle {
    vehicleId: number;
    kvkId: number;
    vehicleName: string;
    registrationNo: string;
    yearOfPurchase: number;
    totalCost: number;
    totalRun: string;
    presentStatus: 'WORKING' | 'GOOD_CONDITION' | 'NEW';
    // New fields
    reportingYear?: string;
    sourceOfFunding?: string;
    repairingCost?: number;

    kvk?: { kvkId: number; kvkName: string };
}

export interface KvkEquipment {
    equipmentId: number;
    kvkId: number;
    equipmentName: string;
    yearOfPurchase: number;
    totalCost: number;
    presentStatus: 'WORKING' | 'GOOD_CONDITION' | 'NEW';
    sourceOfFunding: string;
    reportingYear: number;
    type: 'EQUIPMENT' | 'FARM_IMPLEMENT';
    kvk?: { kvkId: number; kvkName: string };
}

export interface KvkFarmImplement {
    implementId: number;
    kvkId: number;
    implementName: string;
    yearOfPurchase: number;
    totalCost: number;
    presentStatus: 'WORKING' | 'GOOD_CONDITION' | 'NEW' | 'REPAIRABLE' | 'NOT_WORKING';
    sourceOfFund: string;
    createdAt?: string;
    updatedAt?: string;
    kvk?: { kvkId: number; kvkName: string };
}

// Form Data types (for creation/updates)
export type KvkFormData = Omit<Kvk, 'kvkId' | 'zone' | 'state' | 'district' | 'org'>;
export type KvkBankAccountFormData = Omit<KvkBankAccount, 'bankAccountId' | 'kvk' | 'createdAt' | 'updatedAt'>;
export type KvkEmployeeFormData = Omit<KvkEmployee, 'kvkStaffId' | 'kvk' | 'sanctionedPost' | 'discipline'>;
export type KvkInfrastructureFormData = Omit<KvkInfrastructure, 'infraId' | 'kvk' | 'infraMaster' | 'createdAt' | 'updatedAt'>;
export type KvkVehicleFormData = Omit<KvkVehicle, 'vehicleId' | 'kvk'>;
export type KvkEquipmentFormData = Omit<KvkEquipment, 'equipmentId' | 'kvk'>;
export type KvkFarmImplementFormData = Omit<KvkFarmImplement, 'implementId' | 'kvk' | 'createdAt' | 'updatedAt'>;
