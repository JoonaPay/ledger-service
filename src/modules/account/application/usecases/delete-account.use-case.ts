import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";
import { DeleteAccountCommand } from "@modules/account/application/commands/delete-account.command";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DeleteAccountUseCase {
  constructor(private readonly repository: AccountRepository) {}

  async execute(command: DeleteAccountCommand) {
    await this.repository.delete(command.id);
  }
}