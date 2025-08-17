export declare enum AccountType {
    ASSET = "asset",
    LIABILITY = "liability",
    EQUITY = "equity",
    REVENUE = "revenue",
    EXPENSE = "expense",
    USER_WALLET = "user_wallet",
    SYSTEM_RESERVE = "system_reserve",
    FEE_COLLECTION = "fee_collection"
}
export declare enum AccountStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    CLOSED = "closed"
}
export declare class Account {
    readonly id: string;
    readonly name: string;
    readonly type: AccountType;
    readonly currency: string;
    readonly balance: number;
    readonly availableBalance: number;
    readonly status: AccountStatus;
    readonly ownerId?: string;
    readonly parentAccountId?: string;
    readonly metadata?: Record<string, any>;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    constructor(id: string, name: string, type: AccountType, currency: string, balance: number, availableBalance: number, status: AccountStatus, ownerId?: string, parentAccountId?: string, metadata?: Record<string, any>, createdAt?: Date, updatedAt?: Date);
    static create(data: {
        id: string;
        name: string;
        type: AccountType;
        currency: string;
        balance?: number;
        availableBalance?: number;
        status?: AccountStatus;
        ownerId?: string;
        parentAccountId?: string;
        metadata?: Record<string, any>;
    }): Account;
    updateBalance(newBalance: number, newAvailableBalance?: number): Account;
    updateStatus(newStatus: AccountStatus): Account;
    canDebit(amount: number): boolean;
    canCredit(): boolean;
    isUserAccount(): boolean;
    isSystemAccount(): boolean;
    toJSON(): {
        id: string;
        name: string;
        type: AccountType;
        currency: string;
        balance: number;
        availableBalance: number;
        status: AccountStatus;
        ownerId: string;
        parentAccountId: string;
        metadata: Record<string, any>;
        createdAt: Date;
        updatedAt: Date;
    };
}
