import { AccountStatus } from '../../../infrastructure/orm-entities';
export declare class UpdateAccountDto {
    accountName?: string;
    status?: AccountStatus;
    metadata?: Record<string, any>;
}
