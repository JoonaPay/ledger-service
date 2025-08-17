import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany
} from 'typeorm';
import { TransactionOrmEntity } from './transaction.entity';
import { TransactionEntryOrmEntity } from './transaction-entry.entity';
import { BalanceSnapshotOrmEntity } from './balance-snapshot.entity';
import { ReconciliationLogOrmEntity } from './reconciliation-log.entity';

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum NormalBalance {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity('ledger_accounts')
@Index(['identityAccountId'])
@Index(['userId'])
@Index(['accountType'])
@Index(['currency'])
@Index(['blnkAccountId'])
@Index(['parentAccountId'])
@Index(['status'])
@Index(['isActive', 'deletedAt'])
export class LedgerAccountOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'identity_account_id', type: 'uuid' })
  @Index()
  identityAccountId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'account_name', length: 255 })
  accountName: string;

  @Column({ 
    name: 'account_type',
    type: 'enum',
    enum: AccountType,
    default: AccountType.ASSET
  })
  accountType: AccountType;

  @Column({ length: 3 })
  currency: string;

  @Column({ 
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  balance: number;

  @Column({ 
    name: 'credit_balance',
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  creditBalance: number;

  @Column({ 
    name: 'debit_balance',
    type: 'decimal',
    precision: 19,
    scale: 4,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  debitBalance: number;

  @Column({ name: 'blnk_account_id', length: 255, nullable: true })
  blnkAccountId?: string;

  @Column({ name: 'parent_account_id', type: 'uuid', nullable: true })
  parentAccountId?: string;

  @Column({ name: 'account_level', type: 'integer', default: 1 })
  accountLevel: number;

  @Column({ name: 'is_contra', type: 'boolean', default: false })
  isContra: boolean;

  @Column({ 
    name: 'normal_balance',
    type: 'enum',
    enum: NormalBalance,
    default: NormalBalance.DEBIT
  })
  normalBalance: NormalBalance;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ 
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE
  })
  status: AccountStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relations
  @OneToMany(() => TransactionOrmEntity, transaction => transaction.account)
  transactions: TransactionOrmEntity[];

  @OneToMany(() => TransactionOrmEntity, transaction => transaction.counterpartyAccount)
  counterpartyTransactions: TransactionOrmEntity[];

  @OneToMany(() => TransactionEntryOrmEntity, entry => entry.account)
  transactionEntries: TransactionEntryOrmEntity[];

  @OneToMany(() => BalanceSnapshotOrmEntity, snapshot => snapshot.account)
  balanceSnapshots: BalanceSnapshotOrmEntity[];

  @OneToMany(() => ReconciliationLogOrmEntity, log => log.account)
  reconciliationLogs: ReconciliationLogOrmEntity[];
}