import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteTransactionUseCase } from "@modules/transaction/application/usecases/delete-transaction.use-case";
import { DeleteTransactionDto } from "@modules/transaction/application/dto/requests/delete-transaction.dto";

export class DeleteTransactionCommand {
  public readonly id: string;
  
  constructor(
    data: DeleteTransactionDto,
    public readonly contextId: string, // e.g., userId, tenantId
  ) {
    this.id = data.id;
  }
}

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler
  implements ICommandHandler<DeleteTransactionCommand>
{
  constructor(private readonly useCase: DeleteTransactionUseCase) {}

  async execute(command: DeleteTransactionCommand) {
    return this.useCase.execute(command);
  }
}