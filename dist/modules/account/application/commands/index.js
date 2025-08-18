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
__exportStar(require("./create-account.command"), exports);
__exportStar(require("./update-account.command"), exports);
__exportStar(require("./delete-account.command"), exports);
const create_account_command_1 = require("./create-account.command");
const update_account_command_1 = require("./update-account.command");
const delete_account_command_1 = require("./delete-account.command");
exports.CommandHandlers = [
    create_account_command_1.CreateAccountHandler,
    update_account_command_1.UpdateAccountHandler,
    delete_account_command_1.DeleteAccountHandler,
];
//# sourceMappingURL=index.js.map