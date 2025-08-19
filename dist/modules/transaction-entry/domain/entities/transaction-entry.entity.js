"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionEntryEntity = void 0;
const base_domain_entity_1 = require("../../../../core/domain/base-domain-entity");
const orm_entities_1 = require("../../../ledger/infrastructure/orm-entities");
class TransactionEntryEntity extends base_domain_entity_1.BaseDomainEntity {
    constructor(props) {
        super(props.id);
        this._transactionId = props.transactionId;
        this._accountId = props.accountId;
        this._entryType = props.entryType;
        this._amount = props.amount;
        this._entrySequence = props.entrySequence;
        this._description = props.description;
        this._isReversal = props.isReversal || false;
        this._reversalEntryId = props.reversalEntryId;
        this._balanceBefore = props.balanceBefore || 0;
        this._balanceAfter = props.balanceAfter || 0;
        this._metadata = props.metadata;
    }
    reverse(reversalEntryId) {
        if (this._isReversal) {
            throw new Error('Cannot reverse a reversal entry');
        }
        return new TransactionEntryEntity({
            transactionId: this._transactionId,
            accountId: this._accountId,
            entryType: this._entryType === orm_entities_1.EntryType.DEBIT ? orm_entities_1.EntryType.CREDIT : orm_entities_1.EntryType.DEBIT,
            amount: this._amount,
            entrySequence: this._entrySequence + 1000,
            description: `Reversal of entry ${this.id}`,
            isReversal: true,
            reversalEntryId: this.id,
            balanceBefore: this._balanceAfter,
            balanceAfter: this._balanceBefore,
            metadata: {
                ...this._metadata,
                reversedEntryId: this.id,
                reversalReason: 'Manual reversal'
            }
        });
    }
    updateBalance(balanceBefore, balanceAfter) {
        this._balanceBefore = balanceBefore;
        this._balanceAfter = balanceAfter;
    }
    get transactionId() { return this._transactionId; }
    get accountId() { return this._accountId; }
    get entryType() { return this._entryType; }
    get amount() { return this._amount; }
    get entrySequence() { return this._entrySequence; }
    get description() { return this._description; }
    get isReversal() { return this._isReversal; }
    get reversalEntryId() { return this._reversalEntryId; }
    get balanceBefore() { return this._balanceBefore; }
    get balanceAfter() { return this._balanceAfter; }
    get metadata() { return this._metadata; }
}
exports.TransactionEntryEntity = TransactionEntryEntity;
//# sourceMappingURL=transaction-entry.entity.js.map