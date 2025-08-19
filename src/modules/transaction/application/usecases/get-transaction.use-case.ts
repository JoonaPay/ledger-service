import { Injectable, NotFoundException } from "@nestjs/common";
import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
import { TransactionRepository } from "@modules/transaction/infrastructure/repositories/transaction.repository";

@Injectable()
export class GetTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(id: string): Promise<TransactionEntity> {
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    return transaction;
  }
}