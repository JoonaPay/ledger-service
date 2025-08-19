import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateTransactionDto } from "@modules/transaction/application/dto/requests/create-transaction.dto";
import { UpdateTransactionDto } from "@modules/transaction/application/dto/requests/update-transaction.dto";
import { GetTransactionUseCase } from "@modules/transaction/application/usecases/get-transaction.use-case";
import { ListTransactionsUseCase } from "@modules/transaction/application/usecases/list-transactions.use-case";
export declare class TransactionController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly getTransactionUseCase;
    private readonly listTransactionsUseCase;
    constructor(commandBus: CommandBus, queryBus: QueryBus, getTransactionUseCase: GetTransactionUseCase, listTransactionsUseCase: ListTransactionsUseCase);
    create(dto: CreateTransactionDto): Promise<any>;
    findAll(): Promise<import("../domain/entities").TransactionEntity[]>;
    findOne(id: string): Promise<import("../domain/entities").TransactionEntity>;
    update(id: string, dto: UpdateTransactionDto): Promise<any>;
    delete(id: string): Promise<any>;
}
