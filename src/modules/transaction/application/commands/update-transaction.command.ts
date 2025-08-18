import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateTransactionUseCase } from "@modules/transaction/application/usecases/update-transaction.use-case";
import { UpdateTransactionDto } from "@modules/transaction/application/dto/requests/update-transaction.dto";

export class UpdateTransactionCommand {
  public readonly id: string;
  // Add your command properties here
  // They should match your entity properties in camelCase
  
  constructor(
    id: string,
    data: UpdateTransactionDto,
    public readonly contextId: string, // e.g., userId, tenantId
  ) {
    this.id = id;
    // Transform snake_case DTO to camelCase command properties
    // Example: this.propertyName = data.property_name;
  }
}

@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler
  implements ICommandHandler<UpdateTransactionCommand>
{
  constructor(private readonly useCase: UpdateTransactionUseCase) {}

  async execute(command: UpdateTransactionCommand) {
    return this.useCase.execute(command);
  }
}