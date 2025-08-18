"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandlers = void 0;
__exportStar(require("./create-transaction-entry.command"), exports);
__exportStar(require("./update-transaction-entry.command"), exports);
__exportStar(require("./delete-transaction-entry.command"), exports);
const create_transaction_entry_command_1 = require("./create-transaction-entry.command");
const update_transaction_entry_command_1 = require("./update-transaction-entry.command");
const delete_transaction_entry_command_1 = require("./delete-transaction-entry.command");
exports.CommandHandlers = [
    create_transaction_entry_command_1.CreateTransactionEntryHandler,
    update_transaction_entry_command_1.UpdateTransactionEntryHandler,
    delete_transaction_entry_command_1.DeleteTransactionEntryHandler,
];
//# sourceMappingURL=index.js.map