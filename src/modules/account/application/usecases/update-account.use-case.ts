import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";
import { UpdateAccountCommand } from "@modules/account/application/commands/update-account.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateAccountUseCase {
  constructor(private readonly repository: AccountRepository) {}

  async execute(command: UpdateAccountCommand) {
    // TODO: Implement proper entity update with business logic
    throw new Error('Not implemented');
  }
}