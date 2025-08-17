import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
  Logger,
  BadRequestException,
  NotFoundException,
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
import { Repository, FindManyOptions, Between, Like } from 'typeorm';
import { 
  TransactionOrmEntity, 
  TransactionType, 
  TransactionStatus,
  TransactionSource,
  ComplianceStatus
} from '../../infrastructure/orm-entities';
import { TransactionProcessorService } from '../domain/services/transaction-processor.service';
import { ProcessTransactionDto, ReverseTransactionDto } from '../dto/requests/process-transaction.dto';
import { 
  TransactionDto, 
  TransactionResultDto, 
  TransactionSearchResultDto,
  TransactionEntryDto 
} from '../dto/responses/transaction.dto';

// Mock auth guard - replace with actual JWT guard
class JwtAuthGuard {}

@ApiTags('Transactions')
@Controller('api/v1/transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly transactionRepository: Repository<TransactionOrmEntity>,
    private readonly transactionProcessor: TransactionProcessorService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Process transaction',
    description: 'Processes a financial transaction with double-entry bookkeeping',
  })
  @ApiBody({ type: ProcessTransactionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction processed successfully',
    type: TransactionResultDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid transaction data',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Transaction validation failed',
  })
  @HttpCode(HttpStatus.CREATED)
  async processTransaction(
    @Body(ValidationPipe) processTransactionDto: ProcessTransactionDto
  ): Promise<TransactionResultDto> {
    this.logger.log(`Processing transaction: ${processTransactionDto.type} - ${processTransactionDto.amount} ${processTransactionDto.currency}`);

    try {
      const result = await this.transactionProcessor.processTransaction(processTransactionDto);
      this.logger.log(`Transaction processed successfully: ${result.transactionId}`);
      return result;
    } catch (error) {
      this.logger.error(`Transaction processing failed: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Search transactions',
    description: 'Retrieves transactions with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'accountId',
    required: false,
    description: 'Filter by account ID',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TransactionType,
    description: 'Filter by transaction type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TransactionStatus,
    description: 'Filter by transaction status',
  })
  @ApiQuery({
    name: 'source',
    required: false,
    enum: TransactionSource,
    description: 'Filter by transaction source',
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    description: 'Filter by currency',
  })
  @ApiQuery({
    name: 'reference',
    required: false,
    description: 'Filter by transaction reference (partial match)',
  })
  @ApiQuery({
    name: 'minAmount',
    required: false,
    type: Number,
    description: 'Minimum transaction amount',
  })
  @ApiQuery({
    name: 'maxAmount',
    required: false,
    type: Number,
    description: 'Maximum transaction amount',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for date range filter (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for date range filter (ISO 8601)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of transactions to return (max 100)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of transactions to skip',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transactions retrieved successfully',
    type: TransactionSearchResultDto,
  })
  async searchTransactions(
    @Query('accountId') accountId?: string,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('source') source?: TransactionSource,
    @Query('currency') currency?: string,
    @Query('reference') reference?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0
  ): Promise<TransactionSearchResultDto> {
    const where: any = {};

    // Build filter conditions
    if (accountId) {
      where.accountId = accountId;
    }
    if (type) {
      where.transactionType = type;
    }
    if (status) {
      where.status = status;
    }
    if (source) {
      where.source = source;
    }
    if (currency) {
      where.currency = currency;
    }
    if (reference) {
      where.transactionReference = Like(`%${reference}%`);
    }
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date();
      where.createdAt = Between(start, end);
    }

    const findOptions: FindManyOptions<TransactionOrmEntity> = {
      where,
      take: Math.min(limit, 100), // Limit to max 100
      skip: offset,
      order: { createdAt: 'DESC' },
      relations: ['entries'],
    };

    const [transactions, total] = await this.transactionRepository.findAndCount(findOptions);

    return {
      transactions: transactions.map(transaction => this.mapToTransactionDto(transaction)),
      total,
      limit: findOptions.take!,
      offset,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Retrieves a specific transaction by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction retrieved successfully',
    type: TransactionDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found',
  })
  async getTransaction(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TransactionDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['entries', 'account', 'counterpartyAccount'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.mapToTransactionDto(transaction);
  }

  @Get(':id/status')
  @ApiOperation({
    summary: 'Get transaction status',
    description: 'Retrieves the current status and processing details of a transaction',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction status retrieved successfully',
    type: TransactionResultDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found',
  })
  async getTransactionStatus(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TransactionResultDto | null> {
    const result = await this.transactionProcessor.getTransactionStatus(id);
    
    if (!result) {
      throw new NotFoundException('Transaction not found');
    }

    return result;
  }

  @Post(':id/reverse')
  @ApiOperation({
    summary: 'Reverse transaction',
    description: 'Creates a reversal transaction for a completed transaction',
  })
  @ApiParam({
    name: 'id',
    description: 'Original transaction ID to reverse',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: ReverseTransactionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction reversed successfully',
    type: TransactionResultDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Transaction cannot be reversed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Original transaction not found',
  })
  @HttpCode(HttpStatus.CREATED)
  async reverseTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) reverseTransactionDto: ReverseTransactionDto
  ): Promise<TransactionResultDto> {
    this.logger.log(`Reversing transaction: ${id} - Reason: ${reverseTransactionDto.reason}`);

    try {
      const result = await this.transactionProcessor.reverseTransaction(
        id,
        reverseTransactionDto.reason,
        reverseTransactionDto.initiatedBy
      );

      this.logger.log(`Transaction reversed successfully: ${result.transactionId}`);
      return result;
    } catch (error) {
      this.logger.error(`Transaction reversal failed: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get('reference/:reference')
  @ApiOperation({
    summary: 'Get transaction by reference',
    description: 'Retrieves a transaction by its reference number',
  })
  @ApiParam({
    name: 'reference',
    description: 'Transaction reference',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction retrieved successfully',
    type: TransactionDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found',
  })
  async getTransactionByReference(
    @Param('reference') reference: string
  ): Promise<TransactionDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionReference: reference },
      relations: ['entries', 'account', 'counterpartyAccount'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.mapToTransactionDto(transaction);
  }

  @Get('account/:accountId')
  @ApiOperation({
    summary: 'Get account transactions',
    description: 'Retrieves all transactions for a specific account',
  })
  @ApiParam({
    name: 'accountId',
    description: 'Account ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of transactions to return (max 100)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of transactions to skip',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TransactionStatus,
    description: 'Filter by transaction status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account transactions retrieved successfully',
    type: TransactionSearchResultDto,
  })
  async getAccountTransactions(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
    @Query('status') status?: TransactionStatus
  ): Promise<TransactionSearchResultDto> {
    const where: any = {
      $or: [
        { accountId },
        { counterpartyAccountId: accountId }
      ]
    };

    if (status) {
      where.status = status;
    }

    const findOptions: FindManyOptions<TransactionOrmEntity> = {
      where,
      take: Math.min(limit, 100),
      skip: offset,
      order: { createdAt: 'DESC' },
      relations: ['entries'],
    };

    const [transactions, total] = await this.transactionRepository.findAndCount(findOptions);

    return {
      transactions: transactions.map(transaction => this.mapToTransactionDto(transaction)),
      total,
      limit: findOptions.take!,
      offset,
    };
  }

  @Get('pending/count')
  @ApiOperation({
    summary: 'Get pending transactions count',
    description: 'Returns the number of pending transactions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pending transactions count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        totalAmount: { type: 'number' },
        currencies: {
          type: 'object',
          additionalProperties: { type: 'number' }
        }
      }
    },
  })
  async getPendingTransactionsCount(): Promise<{
    count: number;
    totalAmount: number;
    currencies: Record<string, number>;
  }> {
    const pendingTransactions = await this.transactionRepository.find({
      where: { 
        status: { $in: [TransactionStatus.PENDING, TransactionStatus.PROCESSING] } as any
      },
    });

    const currencies: Record<string, number> = {};
    let totalAmount = 0;

    for (const transaction of pendingTransactions) {
      currencies[transaction.currency] = (currencies[transaction.currency] || 0) + transaction.amount;
      totalAmount += transaction.amount;
    }

    return {
      count: pendingTransactions.length,
      totalAmount,
      currencies,
    };
  }

  @Get('failed/recent')
  @ApiOperation({
    summary: 'Get recent failed transactions',
    description: 'Returns recently failed transactions for monitoring',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of transactions to return (max 50)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recent failed transactions retrieved successfully',
    type: [TransactionDto],
  })
  async getRecentFailedTransactions(
    @Query('limit') limit = 10
  ): Promise<TransactionDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { status: TransactionStatus.FAILED },
      take: Math.min(limit, 50),
      order: { createdAt: 'DESC' },
      relations: ['entries'],
    });

    return transactions.map(transaction => this.mapToTransactionDto(transaction));
  }

  // Helper method to map entity to DTO
  private mapToTransactionDto(transaction: TransactionOrmEntity): TransactionDto {
    const entries: TransactionEntryDto[] = transaction.entries?.map(entry => ({
      accountId: entry.accountId,
      amount: entry.amount,
      type: entry.entryType.toLowerCase() as 'debit' | 'credit',
      balanceBefore: entry.balanceBefore,
      balanceAfter: entry.balanceAfter,
      description: entry.description,
    })) || [];

    return {
      id: transaction.id,
      transactionReference: transaction.transactionReference,
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      accountId: transaction.accountId,
      counterpartyAccountId: transaction.counterpartyAccountId,
      counterpartyName: transaction.counterpartyName,
      blnkTransactionId: transaction.blnkTransactionId,
      externalReference: transaction.externalReference,
      source: transaction.source,
      status: transaction.status,
      balanceBefore: transaction.balanceBefore,
      balanceAfter: transaction.balanceAfter,
      feeAmount: transaction.feeAmount,
      exchangeRate: transaction.exchangeRate,
      settlementDate: transaction.settlementDate,
      valueDate: transaction.valueDate,
      riskScore: transaction.riskScore,
      complianceStatus: transaction.complianceStatus,
      metadata: transaction.metadata,
      processedAt: transaction.processedAt,
      failedReason: transaction.failedReason,
      reversalTransactionId: transaction.reversalTransactionId,
      isReversal: transaction.isReversal,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      entries,
    };
  }
}