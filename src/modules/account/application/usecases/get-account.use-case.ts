import { Injectable, NotFoundException } from "@nestjs/common";
import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";

@Injectable()
export class GetAccountUseCase {
  constructor(private readonly repository: AccountRepository) {}

  async execute(id: string): Promise<AccountEntity> {
    const account = await this.repository.findById(id);
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    return account;
  }
}