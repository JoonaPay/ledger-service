import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateAccountUseCase } from "@modules/account/application/usecases/update-account.use-case";
import { UpdateAccountDto } from "@modules/account/application/dto/requests/update-account.dto";

export class UpdateAccountCommand {
  public readonly id: string;
  // Add your command properties here
  // They should match your entity properties in camelCase
  
  constructor(
    id: string,
    data: UpdateAccountDto,
    public readonly contextId: string, // e.g., userId, tenantId
  ) {
    this.id = id;
    // Transform snake_case DTO to camelCase command properties
    // Example: this.propertyName = data.property_name;
  }
}

@CommandHandler(UpdateAccountCommand)
export class UpdateAccountHandler
  implements ICommandHandler<UpdateAccountCommand>
{
  constructor(private readonly useCase: UpdateAccountUseCase) {}

  async execute(command: UpdateAccountCommand) {
    return this.useCase.execute(command);
  }
}