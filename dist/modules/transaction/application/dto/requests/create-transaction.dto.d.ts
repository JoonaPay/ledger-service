import { TransactionType, TransactionSource } from '@modules/ledger/infrastructure/orm-entities';
export declare class CreateTransactionDto {
    transaction_reference: string;
    transaction_type: TransactionType;
    amount: number;
    currency: string;
    description?: string;
    account_id: string;
    counterparty_account_id?: string;
    source?: TransactionSource;
    metadata?: Record<string, any>;
}
