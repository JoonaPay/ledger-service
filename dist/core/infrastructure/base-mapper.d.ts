import { BaseDomainEntity } from '@core/domain/base-domain-entity';
import { BaseOrmEntity } from './base-orm-entity';
export declare abstract class BaseMapper<DomainEntity extends BaseDomainEntity, OrmEntity extends BaseOrmEntity> {
    abstract toDomain(ormEntity: OrmEntity): DomainEntity;
    abstract toOrm(domainEntity: DomainEntity): OrmEntity;
    toDomainBulk(ormEntities: OrmEntity[]): DomainEntity[];
    toOrmBulk(domainEntities: DomainEntity[]): OrmEntity[];
}
