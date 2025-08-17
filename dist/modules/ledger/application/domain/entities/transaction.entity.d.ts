export declare enum TransactionType {
    TRANSFER = "transfer",
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    FEE = "fee",
    REFUND = "refund",
    ADJUSTMENT = "adjustment",
    INTEREST = "interest",
    PENALTY = "penalty"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    REVERSED = "reversed"
}
export declare class TransactionEntry {
    readonly accountId: string;
    readonly amount: number;
    readonly type: 'debit' | 'credit';
    readonly description?: string;
    constructor(accountId: string, amount: number, type: 'debit' | 'credit', description?: string);
}
export declare class Transaction {
    readonly id: string;
    readonly reference: string;
    readonly type: TransactionType;
    readonly amount: number;
    readonly currency: string;
    readonly description: string;
    readonly entries: TransactionEntry[];
    readonly status: TransactionStatus;
    readonly sourceAccountId?: string;
    readonly destinationAccountId?: string;
    readonly initiatedBy?: string;
    readonly externalReference?: string;
    readonly metadata?: Record<string, any>;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    readonly completedAt?: Date;
    constructor(id: string, reference: string, type: TransactionType, amount: number, currency: string, description: string, entries: TransactionEntry[], status: TransactionStatus, sourceAccountId?: string, destinationAccountId?: string, initiatedBy?: string, externalReference?: string, metadata?: Record<string, any>, createdAt?: Date, updatedAt?: Date, completedAt?: Date);
    static create(data: {
        id: string;
        reference: string;
        type: TransactionType;
        amount: number;
        currency: string;
        description: string;
        entries: TransactionEntry[];
        sourceAccountId?: string;
        destinationAccountId?: string;
        initiatedBy?: string;
        externalReference?: string;
        metadata?: Record<string, any>;
    }): Transaction;
    updateStatus(newStatus: TransactionStatus): Transaction;
    isDoubleEntry(): boolean;
    getDebitEntries(): TransactionEntry[];
    getCreditEntries(): TransactionEntry[];
    canBeReversed(): boolean;
    createReversal(reversalId: string, reversalReference: string): Transaction;
    toJSON(): {
        id: string;
        reference: string;
        type: TransactionType;
        amount: number;
        currency: string;
        description: string;
        entries: TransactionEntry[];
        status: TransactionStatus;
        sourceAccountId: string;
        destinationAccountId: string;
        initiatedBy: string;
        externalReference: string;
        metadata: Record<string, any>;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date;
    };
}
