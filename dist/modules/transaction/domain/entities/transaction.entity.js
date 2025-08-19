"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionEntity = void 0;
const base_domain_entity_1 = require("../../../../core/domain/base-domain-entity");
const orm_entities_1 = require("../../../ledger/infrastructure/orm-entities");
class TransactionEntity extends base_domain_entity_1.BaseDomainEntity {
    constructor(props) {
        super(props.id);
        this._transactionReference = props.transactionReference;
        this._transactionType = props.transactionType;
        this._amount = props.amount;
        this._currency = props.currency;
        this._description = props.description;
        this._accountId = props.accountId;
        this._counterpartyAccountId = props.counterpartyAccountId;
        this._status = props.status || orm_entities_1.TransactionStatus.PENDING;
        this._source = props.source || orm_entities_1.TransactionSource.INTERNAL;
        this._balanceBefore = props.balanceBefore || 0;
        this._balanceAfter = props.balanceAfter || 0;
        this._reversalTransactionId = props.reversalTransactionId;
        this._originalTransactionId = props.originalTransactionId;
        this._isReversal = props.isReversal || false;
        this._complianceStatus = props.complianceStatus || orm_entities_1.ComplianceStatus.CLEAN;
        this._complianceNotes = props.complianceNotes;
        this._metadata = props.metadata;
    }
    process() {
        if (this._status !== orm_entities_1.TransactionStatus.PENDING) {
            throw new Error('Can only process pending transactions');
        }
        this._status = orm_entities_1.TransactionStatus.PROCESSING;
    }
    complete(balanceAfter) {
        if (this._status !== orm_entities_1.TransactionStatus.PROCESSING) {
            throw new Error('Can only complete processing transactions');
        }
        this._status = orm_entities_1.TransactionStatus.COMPLETED;
        this._balanceAfter = balanceAfter;
    }
    fail(reason) {
        if (this._status === orm_entities_1.TransactionStatus.COMPLETED || this._status === orm_entities_1.TransactionStatus.REVERSED) {
            throw new Error('Cannot fail completed or reversed transactions');
        }
        this._status = orm_entities_1.TransactionStatus.FAILED;
        if (!this._metadata) {
            this._metadata = {};
        }
        this._metadata.failureReason = reason;
    }
    cancel() {
        if (this._status !== orm_entities_1.TransactionStatus.PENDING) {
            throw new Error('Can only cancel pending transactions');
        }
        this._status = orm_entities_1.TransactionStatus.CANCELLED;
    }
    flagForCompliance(notes) {
        this._complianceStatus = orm_entities_1.ComplianceStatus.FLAGGED;
        this._complianceNotes = notes;
    }
    get transactionReference() { return this._transactionReference; }
    get transactionType() { return this._transactionType; }
    get amount() { return this._amount; }
    get currency() { return this._currency; }
    get description() { return this._description; }
    get accountId() { return this._accountId; }
    get counterpartyAccountId() { return this._counterpartyAccountId; }
    get status() { return this._status; }
    get source() { return this._source; }
    get balanceBefore() { return this._balanceBefore; }
    get balanceAfter() { return this._balanceAfter; }
    get reversalTransactionId() { return this._reversalTransactionId; }
    get originalTransactionId() { return this._originalTransactionId; }
    get isReversal() { return this._isReversal; }
    get complianceStatus() { return this._complianceStatus; }
    get complianceNotes() { return this._complianceNotes; }
    get metadata() { return this._metadata; }
}
exports.TransactionEntity = TransactionEntity;
//# sourceMappingURL=transaction.entity.js.map