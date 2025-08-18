import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteAccountUseCase } from "@modules/account/application/usecases/delete-account.use-case";
import { DeleteAccountDto } from "@modules/account/application/dto/requests/delete-account.dto";

export class DeleteAccountCommand {
  public readonly id: string;
  
  constructor(
    data: DeleteAccountDto,
    public readonly contextId: string, // e.g., userId, tenantId
  ) {
    this.id = data.id;
  }
}

@CommandHandler(DeleteAccountCommand)
export class DeleteAccountHandler
  implements ICommandHandler<DeleteAccountCommand>
{
  constructor(private readonly useCase: DeleteAccountUseCase) {}

  async execute(command: DeleteAccountCommand) {
    return this.useCase.execute(command);
  }
}