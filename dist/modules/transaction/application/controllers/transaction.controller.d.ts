import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateTransactionDto } from "@modules/transaction/application/dto/requests/create-transaction.dto";
export declare class TransactionController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateTransactionDto): Promise<any>;
    findAll(): void;
    findOne(id: string): void;
    update(id: string, dto: any): void;
    delete(id: string): void;
}
