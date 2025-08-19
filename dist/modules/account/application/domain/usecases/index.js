"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseCases = void 0;
const create_account_use_case_1 = require("../../usecases/create-account.use-case");
const get_account_use_case_1 = require("../../usecases/get-account.use-case");
const list_accounts_use_case_1 = require("../../usecases/list-accounts.use-case");
const update_account_use_case_1 = require("../../usecases/update-account.use-case");
const delete_account_use_case_1 = require("../../usecases/delete-account.use-case");
exports.UseCases = [
    create_account_use_case_1.CreateAccountUseCase,
    get_account_use_case_1.GetAccountUseCase,
    list_accounts_use_case_1.ListAccountsUseCase,
    update_account_use_case_1.UpdateAccountUseCase,
    delete_account_use_case_1.DeleteAccountUseCase,
];
//# sourceMappingURL=index.js.map