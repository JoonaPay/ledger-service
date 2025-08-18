import { BaseDomainEntity } from '@core/domain/base-domain-entity';
export interface AccountEntityProps {
    id?: string;
}
export declare class AccountEntity extends BaseDomainEntity {
    constructor(props: AccountEntityProps);
}
