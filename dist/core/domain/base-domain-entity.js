"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDomainEntity = void 0;
class BaseDomainEntity {
    constructor(id) {
        this._id = id || this.generateId();
        this._createdAt = new Date();
        this._updatedAt = new Date();
    }
    get id() {
        return this._id;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    update() {
        this._updatedAt = new Date();
    }
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    equals(entity) {
        return this._id === entity._id;
    }
}
exports.BaseDomainEntity = BaseDomainEntity;
//# sourceMappingURL=base-domain-entity.js.map