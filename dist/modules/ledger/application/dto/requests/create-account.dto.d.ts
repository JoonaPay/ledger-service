import { AccountType } from '../../../infrastructure/orm-entities';
export declare class CreateAccountDto {
    identityAccountId: string;
    userId: string;
    accountName: string;
    accountType: AccountType;
    currency: string;
    initialBalance?: number;
    parentAccountId?: string;
    accountLevel?: number;
    isContra?: boolean;
    metadata?: Record<string, any>;
}
