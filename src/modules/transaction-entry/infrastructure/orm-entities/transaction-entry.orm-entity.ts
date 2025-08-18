import { Entity } from "typeorm";
import { BaseOrmEntity } from '@core/infrastructure/base-orm-entity';

@Entity("transaction_entries")
export class TransactionEntryOrmEntity extends BaseOrmEntity {
  // Add your columns here
  // Example:
  // @Column({ name: "amount", type: "decimal", precision: 10, scale: 2 })
  // amount: number;
  //
  // @Column({ name: "account_id", type: "uuid" })
  // account_id: string;
}