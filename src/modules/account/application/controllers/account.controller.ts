import { Body, Controller, Get, Param, Post, Delete, Put } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateAccountCommand } from "@modules/account/application/commands/create-account.command";
import { UpdateAccountCommand } from "@modules/account/application/commands/update-account.command";
import { DeleteAccountCommand } from "@modules/account/application/commands/delete-account.command";
import { CreateAccountDto } from "@modules/account/application/dto/requests/create-account.dto";
import { UpdateAccountDto } from "@modules/account/application/dto/requests/update-account.dto";
import { GetAccountUseCase } from "@modules/account/application/usecases/get-account.use-case";
import { ListAccountsUseCase } from "@modules/account/application/usecases/list-accounts.use-case";

@Controller("accounts")
export class AccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly getAccountUseCase: GetAccountUseCase,
    private readonly listAccountsUseCase: ListAccountsUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateAccountDto) {
    const contextId = "extracted-from-token"; // TODO: Get from auth decorator
    const command = new CreateAccountCommand(dto, contextId);
    return this.commandBus.execute(command);
  }

  @Get()
  async findAll() {
    return this.listAccountsUseCase.execute();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.getAccountUseCase.execute(id);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateAccountDto) {
    const contextId = "extracted-from-token"; // TODO: Get from auth decorator
    const command = new UpdateAccountCommand(id, dto, contextId);
    return this.commandBus.execute(command);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    const contextId = "extracted-from-token"; // TODO: Get from auth decorator
    const command = new DeleteAccountCommand({ id }, contextId);
    return this.commandBus.execute(command);
  }
}