import { Injectable } from "@nestjs/common";
import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";

@Injectable()
export class ListAccountsUseCase {
  constructor(private readonly repository: AccountRepository) {}

  async execute(): Promise<AccountEntity[]> {
    return this.repository.findAll();
  }
}