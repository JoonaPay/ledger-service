import { Account, AccountType, AccountStatus } from '../entities/account.entity';

export interface AccountRepository {
  create(account: Account): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByOwnerId(ownerId: string): Promise<Account[]>;
  findByType(type: AccountType): Promise<Account[]>;
  findByStatus(status: AccountStatus): Promise<Account[]>;
  update(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
  updateBalance(id: string, balance: number, availableBalance?: number): Promise<Account>;
  getTotalBalanceByType(type: AccountType, currency: string): Promise<number>;
  findByOwnerIdAndCurrency(ownerId: string, currency: string): Promise<Account[]>;
  createUserWallet(ownerId: string, currency: string, name?: string): Promise<Account>;
  findSystemAccount(type: AccountType, currency: string): Promise<Account | null>;
  createSystemAccount(type: AccountType, currency: string, name: string): Promise<Account>;
}