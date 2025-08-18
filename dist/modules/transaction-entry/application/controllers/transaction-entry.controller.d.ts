import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateTransactionEntryDto } from "@modules/transaction-entry/application/dto/requests/create-transaction-entry.dto";
export declare class TransactionEntryController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateTransactionEntryDto): Promise<any>;
    findAll(): void;
    findOne(id: string): void;
    update(id: string, dto: any): void;
    delete(id: string): void;
}
