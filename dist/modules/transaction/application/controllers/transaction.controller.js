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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const create_transaction_command_1 = require("../commands/create-transaction.command");
const update_transaction_command_1 = require("../commands/update-transaction.command");
const delete_transaction_command_1 = require("../commands/delete-transaction.command");
const create_transaction_dto_1 = require("../dto/requests/create-transaction.dto");
const update_transaction_dto_1 = require("../dto/requests/update-transaction.dto");
const get_transaction_use_case_1 = require("../usecases/get-transaction.use-case");
const list_transactions_use_case_1 = require("../usecases/list-transactions.use-case");
let TransactionController = class TransactionController {
    constructor(commandBus, queryBus, getTransactionUseCase, listTransactionsUseCase) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.getTransactionUseCase = getTransactionUseCase;
        this.listTransactionsUseCase = listTransactionsUseCase;
    }
    create(dto) {
        const contextId = "extracted-from-token";
        const command = new create_transaction_command_1.CreateTransactionCommand(dto, contextId);
        return this.commandBus.execute(command);
    }
    async findAll() {
        return this.listTransactionsUseCase.execute();
    }
    async findOne(id) {
        return this.getTransactionUseCase.execute(id);
    }
    async update(id, dto) {
        const contextId = "extracted-from-token";
        const command = new update_transaction_command_1.UpdateTransactionCommand(id, dto, contextId);
        return this.commandBus.execute(command);
    }
    async delete(id) {
        const contextId = "extracted-from-token";
        const command = new delete_transaction_command_1.DeleteTransactionCommand({ id }, contextId);
        return this.commandBus.execute(command);
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "delete", null);
exports.TransactionController = TransactionController = __decorate([
    (0, common_1.Controller)("transactions"),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        get_transaction_use_case_1.GetTransactionUseCase,
        list_transactions_use_case_1.ListTransactionsUseCase])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map