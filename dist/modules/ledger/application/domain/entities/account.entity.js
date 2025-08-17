"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = exports.AccountStatus = exports.AccountType = void 0;
var AccountType;
(function (AccountType) {
    AccountType["ASSET"] = "asset";
    AccountType["LIABILITY"] = "liability";
    AccountType["EQUITY"] = "equity";
    AccountType["REVENUE"] = "revenue";
    AccountType["EXPENSE"] = "expense";
    AccountType["USER_WALLET"] = "user_wallet";
    AccountType["SYSTEM_RESERVE"] = "system_reserve";
    AccountType["FEE_COLLECTION"] = "fee_collection";
})(AccountType || (exports.AccountType = AccountType = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "active";
    AccountStatus["INACTIVE"] = "inactive";
    AccountStatus["SUSPENDED"] = "suspended";
    AccountStatus["CLOSED"] = "closed";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
class Account {
    constructor(id, name, type, currency, balance, availableBalance, status, ownerId, parentAccountId, metadata, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.currency = currency;
        this.balance = balance;
        this.availableBalance = availableBalance;
        this.status = status;
        this.ownerId = ownerId;
        this.parentAccountId = parentAccountId;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(data) {
        return new Account(data.id, data.name, data.type, data.currency, data.balance || 0, data.availableBalance || 0, data.status || AccountStatus.ACTIVE, data.ownerId, data.parentAccountId, data.metadata, new Date(), new Date());
    }
    updateBalance(newBalance, newAvailableBalance) {
        return new Account(this.id, this.name, this.type, this.currency, newBalance, newAvailableBalance !== undefined ? newAvailableBalance : this.availableBalance, this.status, this.ownerId, this.parentAccountId, this.metadata, this.createdAt, new Date());
    }
    updateStatus(newStatus) {
        return new Account(this.id, this.name, this.type, this.currency, this.balance, this.availableBalance, newStatus, this.ownerId, this.parentAccountId, this.metadata, this.createdAt, new Date());
    }
    canDebit(amount) {
        return this.status === AccountStatus.ACTIVE && this.availableBalance >= amount;
    }
    canCredit() {
        return this.status === AccountStatus.ACTIVE;
    }
    isUserAccount() {
        return this.type === AccountType.USER_WALLET && !!this.ownerId;
    }
    isSystemAccount() {
        return this.type === AccountType.SYSTEM_RESERVE ||
            this.type === AccountType.FEE_COLLECTION;
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            currency: this.currency,
            balance: this.balance,
            availableBalance: this.availableBalance,
            status: this.status,
            ownerId: this.ownerId,
            parentAccountId: this.parentAccountId,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
exports.Account = Account;
//# sourceMappingURL=account.entity.js.map