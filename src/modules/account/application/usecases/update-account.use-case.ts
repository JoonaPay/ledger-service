import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";
import { UpdateAccountCommand } from "@modules/account/application/commands/update-account.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateAccountUseCase {
  constructor(private readonly repository: AccountRepository) {}

  async execute(command: UpdateAccountCommand) {
    const entity = new AccountEntity({ id: command.id });
    return this.repository.update(command.id, entity);
  }
}