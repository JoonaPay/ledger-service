"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controllers = void 0;
const account_controller_1 = require("./account.controller");
const transaction_controller_1 = require("./transaction.controller");
const transfer_controller_1 = require("./transfer.controller");
const webhook_controller_1 = require("./webhook.controller");
exports.Controllers = [
    account_controller_1.AccountController,
    transaction_controller_1.TransactionController,
    transfer_controller_1.TransferController,
    webhook_controller_1.WebhookController,
];
//# sourceMappingURL=index.js.map