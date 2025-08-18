import { Entity } from "typeorm";
import { BaseOrmEntity } from '@core/infrastructure/base-orm-entity';

@Entity("transactions")
export class TransactionOrmEntity extends BaseOrmEntity {
  // Add your columns here
  // Example:
  // @Column()
  // amount: number;
  
  // @Column()
  // description: string;
}