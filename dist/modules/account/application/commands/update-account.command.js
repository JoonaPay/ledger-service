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
exports.UpdateAccountHandler = exports.UpdateAccountCommand = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const update_account_use_case_1 = require("../usecases/update-account.use-case");
class UpdateAccountCommand {
    constructor(id, data, contextId) {
        this.contextId = contextId;
        this.id = id;
    }
}
exports.UpdateAccountCommand = UpdateAccountCommand;
let UpdateAccountHandler = class UpdateAccountHandler {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async execute(command) {
        return this.useCase.execute(command);
    }
};
exports.UpdateAccountHandler = UpdateAccountHandler;
exports.UpdateAccountHandler = UpdateAccountHandler = __decorate([
    (0, cqrs_1.CommandHandler)(UpdateAccountCommand),
    __metadata("design:paramtypes", [update_account_use_case_1.UpdateAccountUseCase])
], UpdateAccountHandler);
//# sourceMappingURL=update-account.command.js.map