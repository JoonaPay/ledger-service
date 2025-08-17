import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { LedgerAccountOrmEntity } from './ledger-account.entity';

export enum SnapshotType {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  MANUAL = 'MANUAL',
  RECONCILIATION = 'RECONCILIATION',
}

@Entity('balance_snapshots')
@Index(['accountId', 'snapshotDate'])
@Index(['snapshotType'])
@Index(['currency'])
@Index(['isReconciled'])
@Index(['createdAt'])
@Unique(['accountId', 'snapshotDate'])
export class BalanceSnapshotOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  @Index()
  accountId: string;

  @Column({ name: 'snapshot_date', type: 'date' })
  @Index()
  snapshotDate: Date;

  @Column({ name: 'snapshot_time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  snapshotTime: Date;

  @Column({ 
    name: 'opening_balance',
    type: 'decimal',
    precision: 19,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  openingBalance: number;

  @Column({ 
    name: 'closing_balance',
    type: 'decimal',
    precision: 19,
    scale: 4,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  closingBalance: number;

  @Column({ 
    name: 'total_debits',
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  totalDebits: number;

  @Column({ 
    name: 'total_credits',
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  totalCredits: number;

  @Column({ name: 'transaction_count', type: 'integer', default: 0 })
  transactionCount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ 
    name: 'snapshot_type',
    type: 'enum',
    enum: SnapshotType,
    default: SnapshotType.DAILY
  })
  snapshotType: SnapshotType;

  @Column({ name: 'is_reconciled', type: 'boolean', default: false })
  isReconciled: boolean;

  @Column({ name: 'reconciled_at', type: 'timestamp', nullable: true })
  reconciledAt?: Date;

  @Column({ name: 'reconciled_by', length: 255, nullable: true })
  reconciledBy?: string;

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

  @Column({ name: 'variance_reason', type: 'text', nullable: true })
  varianceReason?: string;

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
}