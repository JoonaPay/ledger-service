"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrmEntities = exports.ReconciliationLogOrmEntity = exports.BalanceSnapshotOrmEntity = exports.TransactionEntryOrmEntity = exports.TransactionOrmEntity = exports.LedgerAccountOrmEntity = void 0;
var ledger_account_entity_1 = require("./ledger-account.entity");
Object.defineProperty(exports, "LedgerAccountOrmEntity", { enumerable: true, get: function () { return ledger_account_entity_1.LedgerAccountOrmEntity; } });
var transaction_entity_1 = require("./transaction.entity");
Object.defineProperty(exports, "TransactionOrmEntity", { enumerable: true, get: function () { return transaction_entity_1.TransactionOrmEntity; } });
var transaction_entry_entity_1 = require("./transaction-entry.entity");
Object.defineProperty(exports, "TransactionEntryOrmEntity", { enumerable: true, get: function () { return transaction_entry_entity_1.TransactionEntryOrmEntity; } });
var balance_snapshot_entity_1 = require("./balance-snapshot.entity");
Object.defineProperty(exports, "BalanceSnapshotOrmEntity", { enumerable: true, get: function () { return balance_snapshot_entity_1.BalanceSnapshotOrmEntity; } });
var reconciliation_log_entity_1 = require("./reconciliation-log.entity");
Object.defineProperty(exports, "ReconciliationLogOrmEntity", { enumerable: true, get: function () { return reconciliation_log_entity_1.ReconciliationLogOrmEntity; } });
exports.OrmEntities = [
    LedgerAccountOrmEntity,
    TransactionOrmEntity,
    TransactionEntryOrmEntity,
    BalanceSnapshotOrmEntity,
    ReconciliationLogOrmEntity,
];
//# sourceMappingURL=index.js.map