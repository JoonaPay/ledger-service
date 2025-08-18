import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateTransactionEntryUseCase } from "@modules/transaction-entry/application/usecases/update-transaction-entry.use-case";
import { UpdateTransactionEntryDto } from "@modules/transaction-entry/application/dto/requests/update-transaction-entry.dto";

export class UpdateTransactionEntryCommand {
  public readonly id: string;
  // Add your command properties here
  // They should match your entity properties in camelCase
  
  constructor(
    id: string,
    data: UpdateTransactionEntryDto,
    public readonly contextId: string, // e.g., userId, tenantId
  ) {
    this.id = id;
    // Transform snake_case DTO to camelCase command properties
    // Example: this.amount = data.amount;
    // Example: this.accountId = data.account_id;
  }
}

@CommandHandler(UpdateTransactionEntryCommand)
export class UpdateTransactionEntryHandler
  implements ICommandHandler<UpdateTransactionEntryCommand>
{
  constructor(private readonly useCase: UpdateTransactionEntryUseCase) {}

  async execute(command: UpdateTransactionEntryCommand) {
    return this.useCase.execute(command);
  }
}