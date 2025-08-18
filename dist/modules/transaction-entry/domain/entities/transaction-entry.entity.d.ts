import { BaseDomainEntity } from '@core/domain/base-domain-entity';
export interface TransactionEntryEntityProps {
    id?: string;
}
export declare class TransactionEntryEntity extends BaseDomainEntity {
    constructor(props: TransactionEntryEntityProps);
}
