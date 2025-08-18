import { BaseDomainEntity } from '@core/domain/base-domain-entity';
import { TransactionType, TransactionStatus, TransactionSource, ComplianceStatus } from '@modules/ledger/infrastructure/orm-entities';

export interface TransactionEntityProps {
  id?: string;
  transactionReference: string;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  accountId: string;
  counterpartyAccountId?: string;
  status?: TransactionStatus;
  source?: TransactionSource;
  balanceBefore?: number;
  balanceAfter?: number;
  reversalTransactionId?: string;
  originalTransactionId?: string;
  isReversal?: boolean;
  complianceStatus?: ComplianceStatus;
  complianceNotes?: string;
  metadata?: Record<string, any>;
}

export class TransactionEntity extends BaseDomainEntity {
  private _transactionReference: string;
  private _transactionType: TransactionType;
  private _amount: number;
  private _currency: string;
  private _description?: string;
  private _accountId: string;
  private _counterpartyAccountId?: string;
  private _status: TransactionStatus;
  private _source: TransactionSource;
  private _balanceBefore: number;
  private _balanceAfter: number;
  private _reversalTransactionId?: string;
  private _originalTransactionId?: string;
  private _isReversal: boolean;
  private _complianceStatus: ComplianceStatus;
  private _complianceNotes?: string;
  private _metadata?: Record<string, any>;

  constructor(props: TransactionEntityProps) {
    super(props.id);
    this._transactionReference = props.transactionReference;
    this._transactionType = props.transactionType;
    this._amount = props.amount;
    this._currency = props.currency;
    this._description = props.description;
    this._accountId = props.accountId;
    this._counterpartyAccountId = props.counterpartyAccountId;
    this._status = props.status || TransactionStatus.PENDING;
    this._source = props.source || TransactionSource.INTERNAL;
    this._balanceBefore = props.balanceBefore || 0;
    this._balanceAfter = props.balanceAfter || 0;
    this._reversalTransactionId = props.reversalTransactionId;
    this._originalTransactionId = props.originalTransactionId;
    this._isReversal = props.isReversal || false;
    this._complianceStatus = props.complianceStatus || ComplianceStatus.CLEAN;
    this._complianceNotes = props.complianceNotes;
    this._metadata = props.metadata;
  }

  // Business methods
  process(): void {
    if (this._status !== TransactionStatus.PENDING) {
      throw new Error('Can only process pending transactions');
    }
    this._status = TransactionStatus.PROCESSING;
  }

  complete(balanceAfter: number): void {
    if (this._status !== TransactionStatus.PROCESSING) {
      throw new Error('Can only complete processing transactions');
    }
    this._status = TransactionStatus.COMPLETED;
    this._balanceAfter = balanceAfter;
  }

  fail(reason: string): void {
    if (this._status === TransactionStatus.COMPLETED || this._status === TransactionStatus.REVERSED) {
      throw new Error('Cannot fail completed or reversed transactions');
    }
    this._status = TransactionStatus.FAILED;
    if (!this._metadata) {
      this._metadata = {};
    }
    this._metadata.failureReason = reason;
  }

  cancel(): void {
    if (this._status !== TransactionStatus.PENDING) {
      throw new Error('Can only cancel pending transactions');
    }
    this._status = TransactionStatus.CANCELLED;
  }

  flagForCompliance(notes: string): void {
    this._complianceStatus = ComplianceStatus.FLAGGED;
    this._complianceNotes = notes;
  }

  // Getters
  get transactionReference(): string { return this._transactionReference; }
  get transactionType(): TransactionType { return this._transactionType; }
  get amount(): number { return this._amount; }
  get currency(): string { return this._currency; }
  get description(): string | undefined { return this._description; }
  get accountId(): string { return this._accountId; }
  get counterpartyAccountId(): string | undefined { return this._counterpartyAccountId; }
  get status(): TransactionStatus { return this._status; }
  get source(): TransactionSource { return this._source; }
  get balanceBefore(): number { return this._balanceBefore; }
  get balanceAfter(): number { return this._balanceAfter; }
  get reversalTransactionId(): string | undefined { return this._reversalTransactionId; }
  get originalTransactionId(): string | undefined { return this._originalTransactionId; }
  get isReversal(): boolean { return this._isReversal; }
  get complianceStatus(): ComplianceStatus { return this._complianceStatus; }
  get complianceNotes(): string | undefined { return this._complianceNotes; }
  get metadata(): Record<string, any> | undefined { return this._metadata; }
}