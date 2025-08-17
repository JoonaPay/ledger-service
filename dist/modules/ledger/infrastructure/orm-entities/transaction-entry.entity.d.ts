import { TransactionOrmEntity } from './transaction.entity';
import { LedgerAccountOrmEntity } from './ledger-account.entity';
export declare enum EntryType {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT"
}
export declare class TransactionEntryOrmEntity {
    id: string;
    transactionId: string;
    accountId: string;
    entryType: EntryType;
    amount: number;
    currency: string;
    description?: string;
    balanceBefore: number;
    balanceAfter: number;
    entrySequence: number;
    reversalEntryId?: string;
    isReversal: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    transaction: TransactionOrmEntity;
    account: LedgerAccountOrmEntity;
}
