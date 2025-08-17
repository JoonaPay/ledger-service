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
import { TransactionOrmEntity } from './transaction.entity';
import { LedgerAccountOrmEntity } from './ledger-account.entity';

export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity('transaction_entries')
@Index(['transactionId', 'entrySequence'])
@Index(['accountId', 'createdAt'])
@Index(['entryType'])
@Index(['isReversal', 'reversalEntryId'])
export class TransactionEntryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id', type: 'uuid' })
  @Index()
  transactionId: string;

  @Column({ name: 'account_id', type: 'uuid' })
  @Index()
  accountId: string;

  @Column({ 
    name: 'entry_type',
    type: 'enum',
    enum: EntryType
  })
  entryType: EntryType;

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

  @Column({ name: 'entry_sequence', type: 'integer' })
  entrySequence: number;

  @Column({ name: 'reversal_entry_id', type: 'uuid', nullable: true })
  reversalEntryId?: string;

  @Column({ name: 'is_reversal', type: 'boolean', default: false })
  isReversal: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => TransactionOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionOrmEntity;

  @ManyToOne(() => LedgerAccountOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'account_id' })
  account: LedgerAccountOrmEntity;
}