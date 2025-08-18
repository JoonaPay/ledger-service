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

export class TransactionEntryEntity extends BaseDomainEntity {
  private _transactionId: string;
  private _accountId: string;
  private _entryType: EntryType;
  private _amount: number;
  private _entrySequence: number;
  private _description?: string;
  private _isReversal: boolean;
  private _reversalEntryId?: string;
  private _balanceBefore: number;
  private _balanceAfter: number;
  private _metadata?: Record<string, any>;

  constructor(props: TransactionEntryEntityProps) {
    super(props.id);
    this._transactionId = props.transactionId;
    this._accountId = props.accountId;
    this._entryType = props.entryType;
    this._amount = props.amount;
    this._entrySequence = props.entrySequence;
    this._description = props.description;
    this._isReversal = props.isReversal || false;
    this._reversalEntryId = props.reversalEntryId;
    this._balanceBefore = props.balanceBefore || 0;
    this._balanceAfter = props.balanceAfter || 0;
    this._metadata = props.metadata;
  }

  // Business methods
  reverse(reversalEntryId: string): TransactionEntryEntity {
    if (this._isReversal) {
      throw new Error('Cannot reverse a reversal entry');
    }

    return new TransactionEntryEntity({
      transactionId: this._transactionId,
      accountId: this._accountId,
      entryType: this._entryType === EntryType.DEBIT ? EntryType.CREDIT : EntryType.DEBIT,
      amount: this._amount,
      entrySequence: this._entrySequence + 1000, // Higher sequence for reversals
      description: `Reversal of entry ${this.id}`,
      isReversal: true,
      reversalEntryId: this.id,
      balanceBefore: this._balanceAfter,
      balanceAfter: this._balanceBefore,
      metadata: {
        ...this._metadata,
        reversedEntryId: this.id,
        reversalReason: 'Manual reversal'
      }
    });
  }

  updateBalance(balanceBefore: number, balanceAfter: number): void {
    this._balanceBefore = balanceBefore;
    this._balanceAfter = balanceAfter;
  }

  // Getters
  get transactionId(): string { return this._transactionId; }
  get accountId(): string { return this._accountId; }
  get entryType(): EntryType { return this._entryType; }
  get amount(): number { return this._amount; }
  get entrySequence(): number { return this._entrySequence; }
  get description(): string | undefined { return this._description; }
  get isReversal(): boolean { return this._isReversal; }
  get reversalEntryId(): string | undefined { return this._reversalEntryId; }
  get balanceBefore(): number { return this._balanceBefore; }
  get balanceAfter(): number { return this._balanceAfter; }
  get metadata(): Record<string, any> | undefined { return this._metadata; }
}