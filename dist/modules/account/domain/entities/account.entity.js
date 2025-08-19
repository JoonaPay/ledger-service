"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountEntity = void 0;
const base_domain_entity_1 = require("../../../../core/domain/base-domain-entity");
const orm_entities_1 = require("../../../ledger/infrastructure/orm-entities");
class AccountEntity extends base_domain_entity_1.BaseDomainEntity {
    constructor(props) {
        super(props.id);
        this._identityAccountId = props.identityAccountId;
        this._userId = props.userId;
        this._accountName = props.accountName;
        this._accountType = props.accountType;
        this._currency = props.currency;
        this._balance = props.balance || 0;
        this._creditBalance = props.creditBalance || 0;
        this._debitBalance = props.debitBalance || 0;
        this._normalBalance = props.normalBalance;
        this._status = props.status || orm_entities_1.AccountStatus.ACTIVE;
        this._parentAccountId = props.parentAccountId;
        this._accountNumber = props.accountNumber;
        this._blnkAccountId = props.blnkAccountId;
        this._metadata = props.metadata;
    }
    debit(amount) {
        if (amount <= 0) {
            throw new Error('Debit amount must be positive');
        }
        if (this._normalBalance === orm_entities_1.NormalBalance.DEBIT) {
            this._balance += amount;
        }
        else {
            this._balance -= amount;
        }
        this._debitBalance += amount;
    }
    credit(amount) {
        if (amount <= 0) {
            throw new Error('Credit amount must be positive');
        }
        if (this._normalBalance === orm_entities_1.NormalBalance.CREDIT) {
            this._balance += amount;
        }
        else {
            this._balance -= amount;
        }
        this._creditBalance += amount;
    }
    suspend() {
        if (this._status === orm_entities_1.AccountStatus.CLOSED) {
            throw new Error('Cannot suspend a closed account');
        }
        this._status = orm_entities_1.AccountStatus.SUSPENDED;
    }
    activate() {
        if (this._status === orm_entities_1.AccountStatus.CLOSED) {
            throw new Error('Cannot activate a closed account');
        }
        this._status = orm_entities_1.AccountStatus.ACTIVE;
    }
    close() {
        if (this._balance !== 0) {
            throw new Error('Cannot close account with non-zero balance');
        }
        this._status = orm_entities_1.AccountStatus.CLOSED;
    }
    get identityAccountId() { return this._identityAccountId; }
    get userId() { return this._userId; }
    get accountName() { return this._accountName; }
    get accountType() { return this._accountType; }
    get currency() { return this._currency; }
    get balance() { return this._balance; }
    get creditBalance() { return this._creditBalance; }
    get debitBalance() { return this._debitBalance; }
    get normalBalance() { return this._normalBalance; }
    get status() { return this._status; }
    get parentAccountId() { return this._parentAccountId; }
    get accountNumber() { return this._accountNumber; }
    get blnkAccountId() { return this._blnkAccountId; }
    get metadata() { return this._metadata; }
}
exports.AccountEntity = AccountEntity;
//# sourceMappingURL=account.entity.js.map