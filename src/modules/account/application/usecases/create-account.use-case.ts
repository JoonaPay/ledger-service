import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";
import { CreateAccountCommand } from "@modules/account/application/commands/create-account.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CreateAccountUseCase {
  constructor(private readonly repository: AccountRepository) {}

  async execute(command: CreateAccountCommand) {
    const entity = new AccountEntity({
      identityAccountId: command.identityAccountId,
      userId: command.userId,
      accountName: command.accountName,
      accountType: command.accountType,
      currency: command.currency,
      normalBalance: command.normalBalance,
      parentAccountId: command.parentAccountId,
      accountNumber: command.accountNumber,
      metadata: command.metadata,
    });
    return this.repository.create(entity);
  }
}