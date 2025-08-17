import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { LedgerAccountOrmEntity } from './ledger-account.entity';
import { TransactionEntryOrmEntity } from './transaction-entry.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  FEE = 'FEE',
  INTEREST = 'INTEREST',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

export enum TransactionSource {
  INTERNAL = 'INTERNAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  CRYPTO = 'CRYPTO',
  WIRE = 'WIRE',
  ACH = 'ACH',
  API = 'API',
}

export enum ComplianceStatus {
  CLEAN = 'CLEAN',
  FLAGGED = 'FLAGGED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  BLOCKED = 'BLOCKED',
}

@Entity('transactions')
@Index(['accountId'])
@Index(['transactionReference'])
@Index(['transactionType'])
@Index(['status'])
@Index(['counterpartyAccountId'])
@Index(['blnkTransactionId'])
@Index(['externalReference'])
@Index(['source'])
@Index(['complianceStatus'])
@Index(['valueDate'])
@Index(['processedAt'])
@Index(['createdAt'])
@Index(['isReversal', 'reversalTransactionId'])
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  @Index()
  accountId: string;

  @Column({ name: 'transaction_reference', length: 100, unique: true })
  transactionReference: string;

  @Column({ 
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType
  })
  transactionType: TransactionType;

  @Column({ 
    type: 'decimal',
    precision: 19,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'counterparty_account_id', type: 'uuid', nullable: true })
  counterpartyAccountId?: string;

  @Column({ name: 'counterparty_name', length: 255, nullable: true })
  counterpartyName?: string;

  @Column({ name: 'counterparty_identifier', length: 255, nullable: true })
  counterpartyIdentifier?: string;

  @Column({ name: 'blnk_transaction_id', length: 255, nullable: true })
  blnkTransactionId?: string;

  @Column({ name: 'external_reference', length: 255, nullable: true })
  externalReference?: string;

  @Column({ 
    type: 'enum',
    enum: TransactionSource,
    default: TransactionSource.INTERNAL
  })
  source: TransactionSource;

  @Column({ 
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING
  })
  status: TransactionStatus;

  @Column({ 
    name: 'balance_before',
    type: 'decimal',
    precision: 19,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  balanceBefore: number;

  @Column({ 
    name: 'balance_after',
    type: 'decimal',
    precision: 19,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  balanceAfter: number;

  @Column({ 
    name: 'fee_amount',
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  feeAmount: number;

  @Column({ 
    name: 'exchange_rate',
    type: 'decimal',
    precision: 12,
    scale: 6,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  exchangeRate?: number;

  @Column({ 
    name: 'original_amount',
    type: 'decimal',
    precision: 19,
    scale: 4,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  originalAmount?: number;

  @Column({ name: 'original_currency', length: 3, nullable: true })
  originalCurrency?: string;

  @Column({ name: 'settlement_date', type: 'timestamp', nullable: true })
  settlementDate?: Date;

  @Column({ name: 'value_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  valueDate: Date;

  @Column({ name: 'authorization_code', length: 50, nullable: true })
  authorizationCode?: string;

  @Column({ 
    name: 'risk_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  riskScore?: number;

  @Column({ name: 'risk_flags', type: 'jsonb', nullable: true })
  riskFlags?: Record<string, any>;

  @Column({ 
    name: 'compliance_status',
    type: 'enum',
    enum: ComplianceStatus,
    default: ComplianceStatus.CLEAN
  })
  complianceStatus: ComplianceStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ name: 'failed_reason', type: 'text', nullable: true })
  failedReason?: string;

  @Column({ name: 'reversal_transaction_id', type: 'uuid', nullable: true })
  reversalTransactionId?: string;

  @Column({ name: 'is_reversal', type: 'boolean', default: false })
  isReversal: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => LedgerAccountOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: LedgerAccountOrmEntity;

  @ManyToOne(() => LedgerAccountOrmEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'counterparty_account_id' })
  counterpartyAccount?: LedgerAccountOrmEntity;

  @OneToMany(() => TransactionEntryOrmEntity, entry => entry.transaction)
  entries: TransactionEntryOrmEntity[];
}