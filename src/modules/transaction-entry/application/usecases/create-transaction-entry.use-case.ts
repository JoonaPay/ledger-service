import { TransactionEntryEntity } from "@modules/transaction-entry/domain/entities/transaction-entry.entity";
import { TransactionEntryRepository } from "@modules/transaction-entry/infrastructure/repositories/transaction-entry.repository";
import { CreateTransactionEntryCommand } from "@modules/transaction-entry/application/commands/create-transaction-entry.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CreateTransactionEntryUseCase {
  constructor(private readonly repository: TransactionEntryRepository) {}

  async execute(command: CreateTransactionEntryCommand) {
    // TODO: Implement proper entity creation with business logic
    throw new Error('Not implemented');
  }
}