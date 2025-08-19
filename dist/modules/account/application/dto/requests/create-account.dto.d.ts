import { AccountType, NormalBalance } from '@modules/ledger/infrastructure/orm-entities';
export declare class CreateAccountDto {
    identity_account_id: string;
    user_id: string;
    account_name: string;
    account_type: AccountType;
    currency: string;
    normal_balance: NormalBalance;
    parent_account_id?: string;
    account_number?: string;
    metadata?: Record<string, any>;
}
