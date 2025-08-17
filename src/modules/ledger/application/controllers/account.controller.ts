import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between } from 'typeorm';
import { 
  LedgerAccountOrmEntity, 
  AccountType, 
  AccountStatus,
  TransactionEntryOrmEntity 
} from '../../infrastructure/orm-entities';
import { BalanceService, AccountBalance } from '../domain/services/balance.service';
import { BlnkFinanceService } from '../../infrastructure/external/blnkfinance.service';
import { CreateAccountDto } from '../dto/requests/create-account.dto';
import { UpdateAccountDto } from '../dto/requests/update-account.dto';
import { AccountDto, AccountBalanceDto, AccountStatementDto } from '../dto/responses/account.dto';

// Mock auth guard - replace with actual JWT guard
class JwtAuthGuard {}

@ApiTags('Accounts')
@Controller('api/v1/accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(
    @InjectRepository(LedgerAccountOrmEntity)
    private readonly accountRepository: Repository<LedgerAccountOrmEntity>,
    @InjectRepository(TransactionEntryOrmEntity)
    private readonly entryRepository: Repository<TransactionEntryOrmEntity>,
    private readonly balanceService: BalanceService,
    private readonly blnkFinanceService: BlnkFinanceService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create new ledger account',
    description: 'Creates a new ledger account linked to an identity service account',
  })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created successfully',
    type: AccountDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid account data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Account already exists',
  })
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Body(ValidationPipe) createAccountDto: CreateAccountDto
  ): Promise<AccountDto> {
    this.logger.log(`Creating account: ${createAccountDto.accountName}`);

    // Check if account already exists for this identity account
    const existingAccount = await this.accountRepository.findOne({
      where: {
        identityAccountId: createAccountDto.identityAccountId,
        currency: createAccountDto.currency,
        isActive: true,
      },
    });

    if (existingAccount) {
      throw new Error('Account already exists for this identity account and currency');
    }

    // Create the account
    const account = this.accountRepository.create({
      identityAccountId: createAccountDto.identityAccountId,
      userId: createAccountDto.userId,
      accountName: createAccountDto.accountName,
      accountType: createAccountDto.accountType,
      currency: createAccountDto.currency,
      balance: createAccountDto.initialBalance || 0,
      parentAccountId: createAccountDto.parentAccountId,
      accountLevel: createAccountDto.accountLevel || 1,
      isContra: createAccountDto.isContra || false,
      metadata: createAccountDto.metadata,
    });

    const savedAccount = await this.accountRepository.save(account);

    // Sync with BlnkFinance if enabled
    try {
      await this.blnkFinanceService.syncAccountWithBlnk(savedAccount.id);
    } catch (error) {
      this.logger.warn(`Failed to sync account with BlnkFinance: ${error.message}`);
    }

    this.logger.log(`Account created successfully: ${savedAccount.id}`);
    return this.mapToAccountDto(savedAccount);
  }

  @Get()
  @ApiOperation({
    summary: 'Get accounts',
    description: 'Retrieves a list of accounts with optional filtering',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    description: 'Filter by currency',
  })
  @ApiQuery({
    name: 'accountType',
    required: false,
    enum: AccountType,
    description: 'Filter by account type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AccountStatus,
    description: 'Filter by account status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of accounts to return (max 100)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of accounts to skip',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Accounts retrieved successfully',
    type: [AccountDto],
  })
  async getAccounts(
    @Query('userId') userId?: string,
    @Query('currency') currency?: string,
    @Query('accountType') accountType?: AccountType,
    @Query('status') status?: AccountStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0
  ): Promise<{ accounts: AccountDto[]; total: number; limit: number; offset: number }> {
    const where: any = { isActive: true };

    if (userId) where.userId = userId;
    if (currency) where.currency = currency;
    if (accountType) where.accountType = accountType;
    if (status) where.status = status;

    const findOptions: FindManyOptions<LedgerAccountOrmEntity> = {
      where,
      take: Math.min(limit, 100), // Limit to max 100
      skip: offset,
      order: { createdAt: 'DESC' },
    };

    const [accounts, total] = await this.accountRepository.findAndCount(findOptions);

    return {
      accounts: accounts.map(account => this.mapToAccountDto(account)),
      total,
      limit: findOptions.take!,
      offset,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get account by ID',
    description: 'Retrieves a specific account by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account retrieved successfully',
    type: AccountDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async getAccount(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<AccountDto> {
    const account = await this.accountRepository.findOne({
      where: { id, isActive: true },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    return this.mapToAccountDto(account);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update account',
    description: 'Updates an existing account',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account updated successfully',
    type: AccountDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateAccountDto: UpdateAccountDto
  ): Promise<AccountDto> {
    const account = await this.accountRepository.findOne({
      where: { id, isActive: true },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Update account properties
    Object.assign(account, updateAccountDto);
    account.updatedAt = new Date();

    const updatedAccount = await this.accountRepository.save(account);

    this.logger.log(`Account updated: ${id}`);
    return this.mapToAccountDto(updatedAccount);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete account',
    description: 'Soft deletes an account (sets isActive to false)',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Account deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id, isActive: true },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Check if account has a zero balance before deletion
    const balance = await this.balanceService.getAccountBalance(id);
    if (balance.currentBalance !== 0) {
      throw new Error('Cannot delete account with non-zero balance');
    }

    // Soft delete
    await this.accountRepository.update(id, {
      isActive: false,
      status: AccountStatus.CLOSED,
      deletedAt: new Date(),
    });

    this.logger.log(`Account deleted: ${id}`);
  }

  @Get(':id/balance')
  @ApiOperation({
    summary: 'Get account balance',
    description: 'Retrieves real-time balance information for an account',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Balance retrieved successfully',
    type: AccountBalanceDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async getAccountBalance(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<AccountBalanceDto> {
    const balance = await this.balanceService.getAccountBalance(id);
    return balance;
  }

  @Get(':id/statement')
  @ApiOperation({
    summary: 'Get account statement',
    description: 'Retrieves account statement for a specified period',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Statement start date (ISO 8601)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Statement end date (ISO 8601)',
    example: '2024-01-31',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statement retrieved successfully',
    type: AccountStatementDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async getAccountStatement(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<AccountStatementDto> {
    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Validate account exists
    const account = await this.accountRepository.findOne({
      where: { id, isActive: true },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Get balance history
    const balanceHistory = await this.balanceService.getBalanceHistory(id, start, end);

    // Get transaction entries for the period
    const entries = await this.entryRepository
      .createQueryBuilder('entry')
      .innerJoin('entry.transaction', 'transaction')
      .where('entry.accountId = :accountId', { accountId: id })
      .andWhere('transaction.status = :status', { status: 'COMPLETED' })
      .andWhere('entry.createdAt BETWEEN :start AND :end', { start, end })
      .orderBy('entry.createdAt', 'ASC')
      .getMany();

    const transactions = entries.map(entry => ({
      transactionId: entry.transactionId,
      date: entry.createdAt,
      amount: entry.amount,
      type: entry.entryType.toLowerCase() as 'debit' | 'credit',
      description: entry.description || 'No description',
      balance: entry.balanceAfter,
    }));

    return {
      accountId: id,
      periodStart: start,
      periodEnd: end,
      openingBalance: balanceHistory.summary.openingBalance,
      closingBalance: balanceHistory.summary.closingBalance,
      totalDebits: balanceHistory.summary.totalDebits,
      totalCredits: balanceHistory.summary.totalCredits,
      transactionCount: balanceHistory.summary.transactionCount,
      currency: account.currency,
      transactions,
    };
  }

  @Post(':id/sync')
  @ApiOperation({
    summary: 'Sync account with BlnkFinance',
    description: 'Manually triggers synchronization with external BlnkFinance service',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account synchronized successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async syncAccount(@Param('id', ParseUUIDPipe) id: string): Promise<{
    status: string;
    internalBalance: number;
    externalBalance: number;
    variance: number;
  }> {
    const result = await this.blnkFinanceService.syncAccountWithBlnk(id);
    
    return {
      status: result.status,
      internalBalance: result.internalBalance,
      externalBalance: result.externalBalance,
      variance: result.variance,
    };
  }

  @Post(':id/recalculate-balance')
  @ApiOperation({
    summary: 'Recalculate account balance',
    description: 'Recalculates account balance from transaction entries',
  })
  @ApiParam({
    name: 'id',
    description: 'Account ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Balance recalculated successfully',
    type: AccountBalanceDto,
  })
  async recalculateBalance(@Param('id', ParseUUIDPipe) id: string): Promise<AccountBalanceDto> {
    await this.balanceService.recalculateAccountBalance(id);
    return this.balanceService.getAccountBalance(id);
  }

  // Helper method to map entity to DTO
  private mapToAccountDto(account: LedgerAccountOrmEntity): AccountDto {
    return {
      id: account.id,
      identityAccountId: account.identityAccountId,
      userId: account.userId,
      accountName: account.accountName,
      accountType: account.accountType,
      currency: account.currency,
      balance: account.balance,
      creditBalance: account.creditBalance,
      debitBalance: account.debitBalance,
      blnkAccountId: account.blnkAccountId,
      parentAccountId: account.parentAccountId,
      accountLevel: account.accountLevel,
      isContra: account.isContra,
      normalBalance: account.normalBalance,
      status: account.status,
      isActive: account.isActive,
      metadata: account.metadata,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      deletedAt: account.deletedAt,
    };
  }
}