import { AccountType, AccountStatus, NormalBalance } from '../../../infrastructure/orm-entities';
export declare class AccountDto {
    id: string;
    identityAccountId: string;
    userId: string;
    accountName: string;
    accountType: AccountType;
    currency: string;
    balance: number;
    creditBalance: number;
    debitBalance: number;
    blnkAccountId?: string;
    parentAccountId?: string;
    accountLevel: number;
    isContra: boolean;
    normalBalance: NormalBalance;
    status: AccountStatus;
    isActive: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare class AccountBalanceDto {
    accountId: string;
    currentBalance: number;
    availableBalance: number;
    pendingBalance: number;
    totalDebits: number;
    totalCredits: number;
    currency: string;
    lastUpdated: Date;
}
export declare class AccountStatementDto {
    accountId: string;
    periodStart: Date;
    periodEnd: Date;
    openingBalance: number;
    closingBalance: number;
    totalDebits: number;
    totalCredits: number;
    transactionCount: number;
    currency: string;
    transactions: Array<{
        transactionId: string;
        date: Date;
        amount: number;
        type: 'debit' | 'credit';
        description: string;
        balance: number;
    }>;
}
