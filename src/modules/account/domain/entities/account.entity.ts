import { BaseDomainEntity } from '@core/domain/base-domain-entity';
import { AccountType, AccountStatus, NormalBalance } from '@modules/ledger/infrastructure/orm-entities';

export interface AccountEntityProps {
  id?: string;
  identityAccountId: string;
  userId: string;
  accountName: string;
  accountType: AccountType;
  currency: string;
  balance?: number;
  creditBalance?: number;
  debitBalance?: number;
  normalBalance: NormalBalance;
  status?: AccountStatus;
  parentAccountId?: string;
  accountNumber?: string;
  blnkAccountId?: string;
  metadata?: Record<string, any>;
}

export class AccountEntity extends BaseDomainEntity {
  private _identityAccountId: string;
  private _userId: string;
  private _accountName: string;
  private _accountType: AccountType;
  private _currency: string;
  private _balance: number;
  private _creditBalance: number;
  private _debitBalance: number;
  private _normalBalance: NormalBalance;
  private _status: AccountStatus;
  private _parentAccountId?: string;
  private _accountNumber?: string;
  private _blnkAccountId?: string;
  private _metadata?: Record<string, any>;

  constructor(props: AccountEntityProps) {
    super(props.id);
    this._identityAccountId = props.identityAccountId;
    this._userId = props.userId;
    this._accountName = props.accountName;
    this._accountType = props.accountType;
    this._currency = props.currency;
    this._balance = props.balance || 0;
    this._creditBalance = props.creditBalance || 0;
    this._debitBalance = props.debitBalance || 0;
    this._normalBalance = props.normalBalance;
    this._status = props.status || AccountStatus.ACTIVE;
    this._parentAccountId = props.parentAccountId;
    this._accountNumber = props.accountNumber;
    this._blnkAccountId = props.blnkAccountId;
    this._metadata = props.metadata;
  }

  // Business methods
  debit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }
    if (this._normalBalance === NormalBalance.DEBIT) {
      this._balance += amount;
    } else {
      this._balance -= amount;
    }
    this._debitBalance += amount;
  }

  credit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }
    if (this._normalBalance === NormalBalance.CREDIT) {
      this._balance += amount;
    } else {
      this._balance -= amount;
    }
    this._creditBalance += amount;
  }

  suspend(): void {
    if (this._status === AccountStatus.CLOSED) {
      throw new Error('Cannot suspend a closed account');
    }
    this._status = AccountStatus.SUSPENDED;
  }

  activate(): void {
    if (this._status === AccountStatus.CLOSED) {
      throw new Error('Cannot activate a closed account');
    }
    this._status = AccountStatus.ACTIVE;
  }

  close(): void {
    if (this._balance !== 0) {
      throw new Error('Cannot close account with non-zero balance');
    }
    this._status = AccountStatus.CLOSED;
  }

  // Getters
  get identityAccountId(): string { return this._identityAccountId; }
  get userId(): string { return this._userId; }
  get accountName(): string { return this._accountName; }
  get accountType(): AccountType { return this._accountType; }
  get currency(): string { return this._currency; }
  get balance(): number { return this._balance; }
  get creditBalance(): number { return this._creditBalance; }
  get debitBalance(): number { return this._debitBalance; }
  get normalBalance(): NormalBalance { return this._normalBalance; }
  get status(): AccountStatus { return this._status; }
  get parentAccountId(): string | undefined { return this._parentAccountId; }
  get accountNumber(): string | undefined { return this._accountNumber; }
  get blnkAccountId(): string | undefined { return this._blnkAccountId; }
  get metadata(): Record<string, any> | undefined { return this._metadata; }
}