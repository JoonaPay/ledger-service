"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMapper = void 0;
class BaseMapper {
    toDomainBulk(ormEntities) {
        return ormEntities.map((ormEntity) => this.toDomain(ormEntity));
    }
    toOrmBulk(domainEntities) {
        return domainEntities.map((domainEntity) => this.toOrm(domainEntity));
    }
}
exports.BaseMapper = BaseMapper;
//# sourceMappingURL=base-mapper.js.map