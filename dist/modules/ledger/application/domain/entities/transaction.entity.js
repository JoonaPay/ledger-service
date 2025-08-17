"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.TransactionEntry = exports.TransactionStatus = exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["TRANSFER"] = "transfer";
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["WITHDRAWAL"] = "withdrawal";
    TransactionType["FEE"] = "fee";
    TransactionType["REFUND"] = "refund";
    TransactionType["ADJUSTMENT"] = "adjustment";
    TransactionType["INTEREST"] = "interest";
    TransactionType["PENALTY"] = "penalty";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["PROCESSING"] = "processing";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["CANCELLED"] = "cancelled";
    TransactionStatus["REVERSED"] = "reversed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
class TransactionEntry {
    constructor(accountId, amount, type, description) {
        this.accountId = accountId;
        this.amount = amount;
        this.type = type;
        this.description = description;
    }
}
exports.TransactionEntry = TransactionEntry;
class Transaction {
    constructor(id, reference, type, amount, currency, description, entries, status, sourceAccountId, destinationAccountId, initiatedBy, externalReference, metadata, createdAt, updatedAt, completedAt) {
        this.id = id;
        this.reference = reference;
        this.type = type;
        this.amount = amount;
        this.currency = currency;
        this.description = description;
        this.entries = entries;
        this.status = status;
        this.sourceAccountId = sourceAccountId;
        this.destinationAccountId = destinationAccountId;
        this.initiatedBy = initiatedBy;
        this.externalReference = externalReference;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.completedAt = completedAt;
    }
    static create(data) {
        return new Transaction(data.id, data.reference, data.type, data.amount, data.currency, data.description, data.entries, TransactionStatus.PENDING, data.sourceAccountId, data.destinationAccountId, data.initiatedBy, data.externalReference, data.metadata, new Date(), new Date());
    }
    updateStatus(newStatus) {
        return new Transaction(this.id, this.reference, this.type, this.amount, this.currency, this.description, this.entries, newStatus, this.sourceAccountId, this.destinationAccountId, this.initiatedBy, this.externalReference, this.metadata, this.createdAt, new Date(), newStatus === TransactionStatus.COMPLETED ? new Date() : this.completedAt);
    }
    isDoubleEntry() {
        const totalDebits = this.entries
            .filter(entry => entry.type === 'debit')
            .reduce((sum, entry) => sum + entry.amount, 0);
        const totalCredits = this.entries
            .filter(entry => entry.type === 'credit')
            .reduce((sum, entry) => sum + entry.amount, 0);
        return Math.abs(totalDebits - totalCredits) < 0.01;
    }
    getDebitEntries() {
        return this.entries.filter(entry => entry.type === 'debit');
    }
    getCreditEntries() {
        return this.entries.filter(entry => entry.type === 'credit');
    }
    canBeReversed() {
        return this.status === TransactionStatus.COMPLETED &&
            this.type !== TransactionType.ADJUSTMENT;
    }
    createReversal(reversalId, reversalReference) {
        if (!this.canBeReversed()) {
            throw new Error('Transaction cannot be reversed');
        }
        const reversedEntries = this.entries.map(entry => new TransactionEntry(entry.accountId, entry.amount, entry.type === 'debit' ? 'credit' : 'debit', `Reversal of: ${entry.description || this.description}`));
        return new Transaction(reversalId, reversalReference, TransactionType.ADJUSTMENT, this.amount, this.currency, `Reversal of transaction ${this.reference}`, reversedEntries, TransactionStatus.PENDING, this.destinationAccountId, this.sourceAccountId, this.initiatedBy, this.id, {
            ...this.metadata,
            reversalOf: this.id,
            originalReference: this.reference,
        }, new Date(), new Date());
    }
    toJSON() {
        return {
            id: this.id,
            reference: this.reference,
            type: this.type,
            amount: this.amount,
            currency: this.currency,
            description: this.description,
            entries: this.entries,
            status: this.status,
            sourceAccountId: this.sourceAccountId,
            destinationAccountId: this.destinationAccountId,
            initiatedBy: this.initiatedBy,
            externalReference: this.externalReference,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            completedAt: this.completedAt,
        };
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.entity.js.map