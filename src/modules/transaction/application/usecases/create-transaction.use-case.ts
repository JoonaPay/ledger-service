import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
import { TransactionRepository } from "@modules/transaction/infrastructure/repositories/transaction.repository";
import { CreateTransactionCommand } from "@modules/transaction/application/commands/create-transaction.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CreateTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(command: CreateTransactionCommand) {
    const entity = new TransactionEntity({
      id: undefined,
      // Map command properties to entity props
    });
    return this.repository.create(entity);
  }
}