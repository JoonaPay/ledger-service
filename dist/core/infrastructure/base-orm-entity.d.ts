import { BaseEntity } from 'typeorm';
export declare abstract class BaseOrmEntity extends BaseEntity {
    id: string;
    created_at: Date;
    updated_at: Date;
}
