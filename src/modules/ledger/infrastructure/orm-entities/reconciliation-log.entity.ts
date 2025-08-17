import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { LedgerAccountOrmEntity } from './ledger-account.entity';
import { TransactionOrmEntity } from './transaction.entity';

export enum ReconciliationType {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  MANUAL = 'MANUAL',
  EXTERNAL_BLNK = 'EXTERNAL_BLNK',
  BANK_STATEMENT = 'BANK_STATEMENT',
}

export enum ReconciliationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RECONCILED = 'RECONCILED',
  FAILED = 'FAILED',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

export enum ResolutionAction {
  NO_ACTION = 'NO_ACTION',
  ADJUSTMENT_MADE = 'ADJUSTMENT_MADE',
  EXTERNAL_CORRECTION = 'EXTERNAL_CORRECTION',
  PENDING_INVESTIGATION = 'PENDING_INVESTIGATION',
}

export enum BlnkSyncStatus {
  SYNCED = 'SYNCED',
  OUT_OF_SYNC = 'OUT_OF_SYNC',
  ERROR = 'ERROR',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

@Entity('reconciliation_logs')
@Index(['accountId', 'reconciliationDate'])
@Index(['reconciliationType'])
@Index(['status'])
@Index(['currency'])
@Index(['isWithinTolerance', 'requiresAttention'])
@Index(['blnkSyncStatus'])
@Index(['externalReference'])
@Index(['createdAt'])
@Index(['accountId', 'reconciliationDate', 'reconciliationType'])
export class ReconciliationLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  @Index()
  accountId: string;

  @Column({ name: 'reconciliation_date', type: 'date' })
  @Index()
  reconciliationDate: Date;

  @Column({ 
    name: 'reconciliation_type',
    type: 'enum',
    enum: ReconciliationType
  })
  reconciliationType: ReconciliationType;

  @Column({ name: 'external_source', length: 100, nullable: true })
  externalSource?: string;

  @Column({ 
    name: 'internal_balance',
    type: 'decimal',
    precision: 19,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  internalBalance: number;

  @Column({ 
    name: 'external_balance',
    type: 'decimal',
    precision: 19,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  externalBalance: number;

  @Column({ 
    name: 'variance_amount',
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  varianceAmount: number;

  @Column({ 
    name: 'variance_percentage',
    type: 'decimal',
    precision: 8,
    scale: 4,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  variancePercentage: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ 
    type: 'enum',
    enum: ReconciliationStatus,
    default: ReconciliationStatus.PENDING
  })
  status: ReconciliationStatus;

  @Column({ name: 'reconciled_by', length: 255, nullable: true })
  reconciledBy?: string;

  @Column({ name: 'reconciled_at', type: 'timestamp', nullable: true })
  reconciledAt?: Date;

  @Column({ name: 'variance_reason', type: 'text', nullable: true })
  varianceReason?: string;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ 
    name: 'resolution_action',
    type: 'enum',
    enum: ResolutionAction,
    nullable: true
  })
  resolutionAction?: ResolutionAction;

  @Column({ name: 'adjustment_transaction_id', type: 'uuid', nullable: true })
  adjustmentTransactionId?: string;

  @Column({ name: 'external_reference', length: 255, nullable: true })
  externalReference?: string;

  @Column({ name: 'blnk_account_id', length: 255, nullable: true })
  blnkAccountId?: string;

  @Column({ 
    name: 'blnk_balance',
    type: 'decimal',
    precision: 19,
    scale: 4,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  blnkBalance?: number;

  @Column({ 
    name: 'blnk_sync_status',
    type: 'enum',
    enum: BlnkSyncStatus,
    default: BlnkSyncStatus.NOT_APPLICABLE
  })
  blnkSyncStatus: BlnkSyncStatus;

  @Column({ name: 'transaction_count_internal', type: 'integer', default: 0 })
  transactionCountInternal: number;

  @Column({ name: 'transaction_count_external', type: 'integer', nullable: true })
  transactionCountExternal?: number;

  @Column({ name: 'last_transaction_id', type: 'uuid', nullable: true })
  lastTransactionId?: string;

  @Column({ name: 'reconciliation_window_start', type: 'timestamp', nullable: true })
  reconciliationWindowStart?: Date;

  @Column({ name: 'reconciliation_window_end', type: 'timestamp', nullable: true })
  reconciliationWindowEnd?: Date;

  @Column({ 
    name: 'tolerance_amount',
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0.01,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  toleranceAmount: number;

  @Column({ name: 'is_within_tolerance', type: 'boolean', default: true })
  isWithinTolerance: boolean;

  @Column({ name: 'requires_attention', type: 'boolean', default: false })
  requiresAttention: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => LedgerAccountOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: LedgerAccountOrmEntity;

  @ManyToOne(() => TransactionOrmEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'adjustment_transaction_id' })
  adjustmentTransaction?: TransactionOrmEntity;

  @ManyToOne(() => TransactionOrmEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_transaction_id' })
  lastTransaction?: TransactionOrmEntity;
}