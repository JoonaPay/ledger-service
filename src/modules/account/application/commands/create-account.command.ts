import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateAccountUseCase } from "@modules/account/application/usecases/create-account.use-case";
import { CreateAccountDto } from "@modules/account/application/dto/requests/create-account.dto";
import { AccountType, NormalBalance } from '@modules/ledger/infrastructure/orm-entities';

export class CreateAccountCommand {
  public readonly identityAccountId: string;
  public readonly userId: string;
  public readonly accountName: string;
  public readonly accountType: AccountType;
  public readonly currency: string;
  public readonly normalBalance: NormalBalance;
  public readonly parentAccountId?: string;
  public readonly accountNumber?: string;
  public readonly metadata?: Record<string, any>;
  
  constructor(
    data: CreateAccountDto,
    public readonly contextId: string, // e.g., userId, tenantId
  ) {
    this.identityAccountId = data.identity_account_id;
    this.userId = data.user_id;
    this.accountName = data.account_name;
    this.accountType = data.account_type;
    this.currency = data.currency;
    this.normalBalance = data.normal_balance;
    this.parentAccountId = data.parent_account_id;
    this.accountNumber = data.account_number;
    this.metadata = data.metadata;
  }
}

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler
  implements ICommandHandler<CreateAccountCommand>
{
  constructor(private readonly useCase: CreateAccountUseCase) {}

  async execute(command: CreateAccountCommand) {
    return this.useCase.execute(command);
  }
}