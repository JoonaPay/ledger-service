export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
  USER_WALLET = 'user_wallet',
  SYSTEM_RESERVE = 'system_reserve',
  FEE_COLLECTION = 'fee_collection',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export class Account {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: AccountType,
    public readonly currency: string,
    public readonly balance: number,
    public readonly availableBalance: number,
    public readonly status: AccountStatus,
    public readonly ownerId?: string,
    public readonly parentAccountId?: string,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

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
  }): Account {
    return new Account(
      data.id,
      data.name,
      data.type,
      data.currency,
      data.balance || 0,
      data.availableBalance || 0,
      data.status || AccountStatus.ACTIVE,
      data.ownerId,
      data.parentAccountId,
      data.metadata,
      new Date(),
      new Date(),
    );
  }

  updateBalance(newBalance: number, newAvailableBalance?: number): Account {
    return new Account(
      this.id,
      this.name,
      this.type,
      this.currency,
      newBalance,
      newAvailableBalance !== undefined ? newAvailableBalance : this.availableBalance,
      this.status,
      this.ownerId,
      this.parentAccountId,
      this.metadata,
      this.createdAt,
      new Date(),
    );
  }

  updateStatus(newStatus: AccountStatus): Account {
    return new Account(
      this.id,
      this.name,
      this.type,
      this.currency,
      this.balance,
      this.availableBalance,
      newStatus,
      this.ownerId,
      this.parentAccountId,
      this.metadata,
      this.createdAt,
      new Date(),
    );
  }

  canDebit(amount: number): boolean {
    return this.status === AccountStatus.ACTIVE && this.availableBalance >= amount;
  }

  canCredit(): boolean {
    return this.status === AccountStatus.ACTIVE;
  }

  isUserAccount(): boolean {
    return this.type === AccountType.USER_WALLET && !!this.ownerId;
  }

  isSystemAccount(): boolean {
    return this.type === AccountType.SYSTEM_RESERVE || 
           this.type === AccountType.FEE_COLLECTION;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      currency: this.currency,
      balance: this.balance,
      availableBalance: this.availableBalance,
      status: this.status,
      ownerId: this.ownerId,
      parentAccountId: this.parentAccountId,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}