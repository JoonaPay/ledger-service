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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTransactionEntryHandler = exports.DeleteTransactionEntryCommand = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const delete_transaction_entry_use_case_1 = require("../usecases/delete-transaction-entry.use-case");
class DeleteTransactionEntryCommand {
    constructor(data, contextId) {
        this.contextId = contextId;
        this.id = data.id;
    }
}
exports.DeleteTransactionEntryCommand = DeleteTransactionEntryCommand;
let DeleteTransactionEntryHandler = class DeleteTransactionEntryHandler {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async execute(command) {
        return this.useCase.execute(command);
    }
};
exports.DeleteTransactionEntryHandler = DeleteTransactionEntryHandler;
exports.DeleteTransactionEntryHandler = DeleteTransactionEntryHandler = __decorate([
    (0, cqrs_1.CommandHandler)(DeleteTransactionEntryCommand),
    __metadata("design:paramtypes", [delete_transaction_entry_use_case_1.DeleteTransactionEntryUseCase])
], DeleteTransactionEntryHandler);
//# sourceMappingURL=delete-transaction-entry.command.js.map