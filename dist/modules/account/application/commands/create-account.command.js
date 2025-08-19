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
exports.CreateAccountHandler = exports.CreateAccountCommand = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const create_account_use_case_1 = require("../usecases/create-account.use-case");
class CreateAccountCommand {
    constructor(data, contextId) {
        this.contextId = contextId;
        this.identityAccountId = data.identity_account_id;
        this.userId = data.user_id;
        this.accountName = data.account_name;
        this.accountType = data.account_type;
        this.currency = data.currency;
        this.normalBalance = data.normal_balance;
        this.parentAccountId = data.parent_account_id;
        this.accountNumber = data.account_number;
        this.metadata = data.metadata;
    }
}
exports.CreateAccountCommand = CreateAccountCommand;
let CreateAccountHandler = class CreateAccountHandler {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async execute(command) {
        return this.useCase.execute(command);
    }
};
exports.CreateAccountHandler = CreateAccountHandler;
exports.CreateAccountHandler = CreateAccountHandler = __decorate([
    (0, cqrs_1.CommandHandler)(CreateAccountCommand),
    __metadata("design:paramtypes", [create_account_use_case_1.CreateAccountUseCase])
], CreateAccountHandler);
//# sourceMappingURL=create-account.command.js.map