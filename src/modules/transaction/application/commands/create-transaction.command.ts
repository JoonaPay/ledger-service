import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateTransactionUseCase } from "@modules/transaction/application/usecases/create-transaction.use-case";
import { CreateTransactionDto } from "@modules/transaction/application/dto/requests/create-transaction.dto";

export class CreateTransactionCommand {
  // Add your command properties here
  // They should match your entity properties in camelCase
  
  constructor(
    data: CreateTransactionDto,
    public readonly contextId: string, // e.g., userId, tenantId
  ) {
    // Transform snake_case DTO to camelCase command properties
    // Example: this.propertyName = data.property_name;
  }
}

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand>
{
  constructor(private readonly useCase: CreateTransactionUseCase) {}

  async execute(command: CreateTransactionCommand) {
    return this.useCase.execute(command);
  }
}