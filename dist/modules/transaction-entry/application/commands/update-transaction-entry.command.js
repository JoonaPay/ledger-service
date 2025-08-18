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
exports.UpdateTransactionEntryHandler = exports.UpdateTransactionEntryCommand = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const update_transaction_entry_use_case_1 = require("../usecases/update-transaction-entry.use-case");
class UpdateTransactionEntryCommand {
    constructor(id, data, contextId) {
        this.contextId = contextId;
        this.id = id;
    }
}
exports.UpdateTransactionEntryCommand = UpdateTransactionEntryCommand;
let UpdateTransactionEntryHandler = class UpdateTransactionEntryHandler {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async execute(command) {
        return this.useCase.execute(command);
    }
};
exports.UpdateTransactionEntryHandler = UpdateTransactionEntryHandler;
exports.UpdateTransactionEntryHandler = UpdateTransactionEntryHandler = __decorate([
    (0, cqrs_1.CommandHandler)(UpdateTransactionEntryCommand),
    __metadata("design:paramtypes", [update_transaction_entry_use_case_1.UpdateTransactionEntryUseCase])
], UpdateTransactionEntryHandler);
//# sourceMappingURL=update-transaction-entry.command.js.map