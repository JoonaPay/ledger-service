"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Services = void 0;
const ledger_service_1 = require("./ledger.service");
const double_entry_service_1 = require("./double-entry.service");
const balance_service_1 = require("./balance.service");
const transaction_processor_service_1 = require("./transaction-processor.service");
const currency_service_1 = require("./currency.service");
exports.Services = [
    ledger_service_1.LedgerService,
    double_entry_service_1.DoubleEntryService,
    balance_service_1.BalanceService,
    transaction_processor_service_1.TransactionProcessorService,
    currency_service_1.CurrencyService,
];
//# sourceMappingURL=index.js.map