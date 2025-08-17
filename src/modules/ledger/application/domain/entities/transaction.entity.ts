export enum TransactionType {
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  FEE = 'fee',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
  INTEREST = 'interest',
  PENALTY = 'penalty',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed',
}

export class TransactionEntry {
  constructor(
    public readonly accountId: string,
    public readonly amount: number,
    public readonly type: 'debit' | 'credit',
    public readonly description?: string,
  ) {}
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly reference: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly currency: string,
    public readonly description: string,
    public readonly entries: TransactionEntry[],
    public readonly status: TransactionStatus,
    public readonly sourceAccountId?: string,
    public readonly destinationAccountId?: string,
    public readonly initiatedBy?: string,
    public readonly externalReference?: string,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly completedAt?: Date,
  ) {}

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
  }): Transaction {
    return new Transaction(
      data.id,
      data.reference,
      data.type,
      data.amount,
      data.currency,
      data.description,
      data.entries,
      TransactionStatus.PENDING,
      data.sourceAccountId,
      data.destinationAccountId,
      data.initiatedBy,
      data.externalReference,
      data.metadata,
      new Date(),
      new Date(),
    );
  }

  updateStatus(newStatus: TransactionStatus): Transaction {
    return new Transaction(
      this.id,
      this.reference,
      this.type,
      this.amount,
      this.currency,
      this.description,
      this.entries,
      newStatus,
      this.sourceAccountId,
      this.destinationAccountId,
      this.initiatedBy,
      this.externalReference,
      this.metadata,
      this.createdAt,
      new Date(),
      newStatus === TransactionStatus.COMPLETED ? new Date() : this.completedAt,
    );
  }

  isDoubleEntry(): boolean {
    const totalDebits = this.entries
      .filter(entry => entry.type === 'debit')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalCredits = this.entries
      .filter(entry => entry.type === 'credit')
      .reduce((sum, entry) => sum + entry.amount, 0);

    return Math.abs(totalDebits - totalCredits) < 0.01;
  }

  getDebitEntries(): TransactionEntry[] {
    return this.entries.filter(entry => entry.type === 'debit');
  }

  getCreditEntries(): TransactionEntry[] {
    return this.entries.filter(entry => entry.type === 'credit');
  }

  canBeReversed(): boolean {
    return this.status === TransactionStatus.COMPLETED &&
           this.type !== TransactionType.ADJUSTMENT;
  }

  createReversal(reversalId: string, reversalReference: string): Transaction {
    if (!this.canBeReversed()) {
      throw new Error('Transaction cannot be reversed');
    }

    const reversedEntries = this.entries.map(entry => 
      new TransactionEntry(
        entry.accountId,
        entry.amount,
        entry.type === 'debit' ? 'credit' : 'debit',
        `Reversal of: ${entry.description || this.description}`,
      )
    );

    return new Transaction(
      reversalId,
      reversalReference,
      TransactionType.ADJUSTMENT,
      this.amount,
      this.currency,
      `Reversal of transaction ${this.reference}`,
      reversedEntries,
      TransactionStatus.PENDING,
      this.destinationAccountId,
      this.sourceAccountId,
      this.initiatedBy,
      this.id,
      {
        ...this.metadata,
        reversalOf: this.id,
        originalReference: this.reference,
      },
      new Date(),
      new Date(),
    );
  }

  toJSON() {
    return {
      id: this.id,
      reference: this.reference,
      type: this.type,
      amount: this.amount,
      currency: this.currency,
      description: this.description,
      entries: this.entries,
      status: this.status,
      sourceAccountId: this.sourceAccountId,
      destinationAccountId: this.destinationAccountId,
      initiatedBy: this.initiatedBy,
      externalReference: this.externalReference,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
    };
  }
}