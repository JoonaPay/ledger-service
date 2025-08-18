import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateAccountDto } from "@modules/account/application/dto/requests/create-account.dto";
export declare class AccountController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateAccountDto): Promise<any>;
    findAll(): void;
    findOne(id: string): void;
    update(id: string, dto: any): void;
    delete(id: string): void;
}
