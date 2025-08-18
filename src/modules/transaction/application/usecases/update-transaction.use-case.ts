import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
import { TransactionRepository } from "@modules/transaction/infrastructure/repositories/transaction.repository";
import { UpdateTransactionCommand } from "@modules/transaction/application/commands/update-transaction.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(command: UpdateTransactionCommand) {
    const entity = new TransactionEntity({ id: command.id });
    return this.repository.update(command.id, entity);
  }
}