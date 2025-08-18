import { TransactionRepository } from "@modules/transaction/infrastructure/repositories/transaction.repository";
import { DeleteTransactionCommand } from "@modules/transaction/application/commands/delete-transaction.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DeleteTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(command: DeleteTransactionCommand) {
    await this.repository.delete(command.id);
  }
}