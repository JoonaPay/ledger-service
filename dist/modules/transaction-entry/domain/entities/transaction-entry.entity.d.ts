import { BaseDomainEntity } from '@core/domain/base-domain-entity';
import { EntryType } from '@modules/ledger/infrastructure/orm-entities';
export interface TransactionEntryEntityProps {
    id?: string;
    transactionId: string;
    accountId: string;
    entryType: EntryType;
    amount: number;
    entrySequence: number;
    description?: string;
    isReversal?: boolean;
    reversalEntryId?: string;
    balanceBefore?: number;
    balanceAfter?: number;
    metadata?: Record<string, any>;
}
export declare class TransactionEntryEntity extends BaseDomainEntity {
    private _transactionId;
    private _accountId;
    private _entryType;
    private _amount;
    private _entrySequence;
    private _description?;
    private _isReversal;
    private _reversalEntryId?;
    private _balanceBefore;
    private _balanceAfter;
    private _metadata?;
    constructor(props: TransactionEntryEntityProps);
    reverse(reversalEntryId: string): TransactionEntryEntity;
    updateBalance(balanceBefore: number, balanceAfter: number): void;
    get transactionId(): string;
    get accountId(): string;
    get entryType(): EntryType;
    get amount(): number;
    get entrySequence(): number;
    get description(): string | undefined;
    get isReversal(): boolean;
    get reversalEntryId(): string | undefined;
    get balanceBefore(): number;
    get balanceAfter(): number;
    get metadata(): Record<string, any> | undefined;
}
