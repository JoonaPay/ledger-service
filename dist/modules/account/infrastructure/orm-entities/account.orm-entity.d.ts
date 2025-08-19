import { BaseOrmEntity } from '@core/infrastructure/base-orm-entity';
import { AccountType, AccountStatus, NormalBalance } from '@modules/ledger/infrastructure/orm-entities';
export declare class AccountOrmEntity extends BaseOrmEntity {
    identityAccountId: string;
    userId: string;
    accountName: string;
    accountType: AccountType;
    currency: string;
    balance: number;
    creditBalance: number;
    debitBalance: number;
    normalBalance: NormalBalance;
    status: AccountStatus;
    parentAccountId?: string;
    accountNumber?: string;
    blnkAccountId?: string;
    metadata?: Record<string, any>;
}
