export declare abstract class BaseDomainEntity {
    protected _id: string;
    protected _createdAt: Date;
    protected _updatedAt: Date;
    constructor(id?: string);
    get id(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
    protected update(): void;
    private generateId;
    equals(entity: BaseDomainEntity): boolean;
}
