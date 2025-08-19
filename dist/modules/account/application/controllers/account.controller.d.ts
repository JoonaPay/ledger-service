import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateAccountDto } from "@modules/account/application/dto/requests/create-account.dto";
import { UpdateAccountDto } from "@modules/account/application/dto/requests/update-account.dto";
import { GetAccountUseCase } from "@modules/account/application/usecases/get-account.use-case";
import { ListAccountsUseCase } from "@modules/account/application/usecases/list-accounts.use-case";
export declare class AccountController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly getAccountUseCase;
    private readonly listAccountsUseCase;
    constructor(commandBus: CommandBus, queryBus: QueryBus, getAccountUseCase: GetAccountUseCase, listAccountsUseCase: ListAccountsUseCase);
    create(dto: CreateAccountDto): Promise<any>;
    findAll(): Promise<import("../domain/entities").AccountEntity[]>;
    findOne(id: string): Promise<import("../domain/entities").AccountEntity>;
    update(id: string, dto: UpdateAccountDto): Promise<any>;
    delete(id: string): Promise<any>;
}
