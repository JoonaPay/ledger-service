import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateTransactionEntryUseCase } from "@modules/transaction-entry/application/usecases/create-transaction-entry.use-case";
import { CreateTransactionEntryDto } from "@modules/transaction-entry/application/dto/requests/create-transaction-entry.dto";

export class CreateTransactionEntryCommand {
  // Add your command properties here
  // They should match your entity properties in camelCase
  
  constructor(
    data: CreateTransactionEntryDto,
    public readonly contextId: string, // e.g., userId, tenantId
  ) {
    // Transform snake_case DTO to camelCase command properties
    // Example: this.amount = data.amount;
    // Example: this.accountId = data.account_id;
  }
}

@CommandHandler(CreateTransactionEntryCommand)
export class CreateTransactionEntryHandler
  implements ICommandHandler<CreateTransactionEntryCommand>
{
  constructor(private readonly useCase: CreateTransactionEntryUseCase) {}

  async execute(command: CreateTransactionEntryCommand) {
    return this.useCase.execute(command);
  }
}