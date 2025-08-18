"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const account_mapper_1 = require("../mappers/account.mapper");
const account_orm_entity_1 = require("../orm-entities/account.orm-entity");
const common_1 = require("@nestjs/common");
let AccountRepository = class AccountRepository {
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async create(entity) {
        const ormEntity = this.mapper.toOrm(entity);
        const savedOrmEntity = await this.repository.save(ormEntity);
        return this.mapper.toDomain(savedOrmEntity);
    }
    async findById(id) {
        const ormEntity = await this.repository.findOne({
            where: { id },
        });
        if (!ormEntity) {
            return null;
        }
        return this.mapper.toDomain(ormEntity);
    }
    async findAll() {
        const ormEntities = await this.repository.find();
        if (!ormEntities) {
            return [];
        }
        return ormEntities.map((ormEntity) => this.mapper.toDomain(ormEntity));
    }
    async update(id, entity) {
        const ormEntity = this.mapper.toOrm(entity);
        await this.repository.update(id, ormEntity);
        return entity;
    }
    async delete(id) {
        await this.repository.delete(id);
    }
};
exports.AccountRepository = AccountRepository;
exports.AccountRepository = AccountRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_orm_entity_1.AccountOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        account_mapper_1.AccountMapper])
], AccountRepository);
//# sourceMappingURL=account.repository.js.map