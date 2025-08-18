import { TransactionEntryEntity } from "@modules/transaction-entry/domain/entities/transaction-entry.entity";
import { TransactionEntryRepository } from "@modules/transaction-entry/infrastructure/repositories/transaction-entry.repository";
import { UpdateTransactionEntryCommand } from "@modules/transaction-entry/application/commands/update-transaction-entry.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateTransactionEntryUseCase {
  constructor(private readonly repository: TransactionEntryRepository) {}

  async execute(command: UpdateTransactionEntryCommand) {
    const entity = new TransactionEntryEntity({ id: command.id });
    return this.repository.update(command.id, entity);
  }
}