import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { BaseOrmEntity } from '@core/infrastructure/base-orm-entity';
import { AccountType, AccountStatus, NormalBalance } from '@modules/ledger/infrastructure/orm-entities';

@Entity("accounts")
@Index(['identityAccountId'])
@Index(['userId'])
@Index(['accountType'])
@Index(['currency'])
@Index(['status'])
export class AccountOrmEntity extends BaseOrmEntity {
  @Column({ name: 'identity_account_id', type: 'uuid' })
  identityAccountId: string;

  @Column({ name: 'user_id', type: 'uuid' })
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

  @Column({
    name: 'normal_balance',
    type: 'enum',
    enum: NormalBalance,
    default: NormalBalance.DEBIT
  })
  normalBalance: NormalBalance;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE
  })
  status: AccountStatus;

  @Column({ name: 'parent_account_id', type: 'uuid', nullable: true })
  parentAccountId?: string;

  @Column({ name: 'account_number', length: 50, nullable: true })
  accountNumber?: string;

  @Column({ name: 'blnk_account_id', length: 255, nullable: true })
  blnkAccountId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}