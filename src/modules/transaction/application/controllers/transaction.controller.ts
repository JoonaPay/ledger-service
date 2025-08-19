import { Body, Controller, Get, Param, Post, Delete, Put } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateTransactionCommand } from "@modules/transaction/application/commands/create-transaction.command";
import { UpdateTransactionCommand } from "@modules/transaction/application/commands/update-transaction.command";
import { DeleteTransactionCommand } from "@modules/transaction/application/commands/delete-transaction.command";
import { CreateTransactionDto } from "@modules/transaction/application/dto/requests/create-transaction.dto";
import { UpdateTransactionDto } from "@modules/transaction/application/dto/requests/update-transaction.dto";
import { GetTransactionUseCase } from "@modules/transaction/application/usecases/get-transaction.use-case";
import { ListTransactionsUseCase } from "@modules/transaction/application/usecases/list-transactions.use-case";

@Controller("transactions")
export class TransactionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly getTransactionUseCase: GetTransactionUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    const contextId = "extracted-from-token"; // TODO: Get from auth decorator
    const command = new CreateTransactionCommand(dto, contextId);
    return this.commandBus.execute(command);
  }

  @Get()
  async findAll() {
    return this.listTransactionsUseCase.execute();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.getTransactionUseCase.execute(id);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateTransactionDto) {
    const contextId = "extracted-from-token"; // TODO: Get from auth decorator
    const command = new UpdateTransactionCommand(id, dto, contextId);
    return this.commandBus.execute(command);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    const contextId = "extracted-from-token"; // TODO: Get from auth decorator
    const command = new DeleteTransactionCommand({ id }, contextId);
    return this.commandBus.execute(command);
  }
}