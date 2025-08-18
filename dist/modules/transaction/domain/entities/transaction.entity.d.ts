import { BaseDomainEntity } from '@core/domain/base-domain-entity';
export interface TransactionEntityProps {
    id?: string;
}
export declare class TransactionEntity extends BaseDomainEntity {
    constructor(props: TransactionEntityProps);
}
