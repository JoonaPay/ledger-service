import { TransactionEntryEntity } from "@modules/transaction-entry/domain/entities/transaction-entry.entity";
import { TransactionEntryRepository } from "@modules/transaction-entry/infrastructure/repositories/transaction-entry.repository";
import { DeleteTransactionEntryCommand } from "@modules/transaction-entry/application/commands/delete-transaction-entry.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DeleteTransactionEntryUseCase {
  constructor(private readonly repository: TransactionEntryRepository) {}

  async execute(command: DeleteTransactionEntryCommand) {
    await this.repository.delete(command.id);
  }
}