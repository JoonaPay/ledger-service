import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteTransactionEntryUseCase } from "@modules/transaction-entry/application/usecases/delete-transaction-entry.use-case";
import { DeleteTransactionEntryDto } from "@modules/transaction-entry/application/dto/requests/delete-transaction-entry.dto";

export class DeleteTransactionEntryCommand {
  public readonly id: string;
  
  constructor(
    data: DeleteTransactionEntryDto,
    public readonly contextId: string, // e.g., userId, tenantId
  ) {
    this.id = data.id;
  }
}

@CommandHandler(DeleteTransactionEntryCommand)
export class DeleteTransactionEntryHandler
  implements ICommandHandler<DeleteTransactionEntryCommand>
{
  constructor(private readonly useCase: DeleteTransactionEntryUseCase) {}

  async execute(command: DeleteTransactionEntryCommand) {
    return this.useCase.execute(command);
  }
}