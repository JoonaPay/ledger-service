import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TransactionProcessorService } from '../domain/services/transaction-processor.service';
import { TransactionType, TransactionSource } from '../../infrastructure/orm-entities';
import { IsNotEmpty, IsString, IsUUID, IsNumber, IsOptional, IsObject, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionResultDto } from '../dto/responses/transaction.dto';

class CreateTransferDto {
  @ApiProperty({
    description: 'Source account ID',
    example: 'acc_123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  sourceAccountId: string;

  @ApiProperty({
    description: 'Destination account ID',
    example: 'acc_789e4567-e89b-12d3-a456-426614174999',
  })
  @IsNotEmpty()
  @IsUUID()
  destinationAccountId: string;

  @ApiProperty({
    description: 'Transfer amount',
    example: 100.50,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiProperty({
    description: 'Transfer description',
    example: 'Transfer to savings account',
    minLength: 1,
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  description: string;

  @ApiPropertyOptional({
    description: 'Transfer reference (auto-generated if not provided)',
    example: 'TFR20240101001',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  reference?: string;

  @ApiPropertyOptional({
    description: 'User or system that initiated the transfer',
    example: 'user_123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  initiatedBy?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the transfer',
    example: { category: 'internal', purpose: 'savings' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// Mock auth guard - replace with actual JWT guard
class JwtAuthGuard {}

@ApiTags('Transfers')
@Controller('api/v1/transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TransferController {
  private readonly logger = new Logger(TransferController.name);

  constructor(
    private readonly transactionProcessor: TransactionProcessorService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create transfer',
    description: 'Creates an internal transfer between two accounts',
  })
  @ApiBody({ type: CreateTransferDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transfer created successfully',
    type: TransactionResultDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid transfer data',
  })
  @HttpCode(HttpStatus.CREATED)
  async createTransfer(
    @Body(ValidationPipe) createTransferDto: CreateTransferDto
  ): Promise<TransactionResultDto> {
    this.logger.log(`Creating transfer: ${createTransferDto.amount} ${createTransferDto.currency} from ${createTransferDto.sourceAccountId} to ${createTransferDto.destinationAccountId}`);

    try {
      const result = await this.transactionProcessor.processTransaction({
        type: TransactionType.TRANSFER,
        amount: createTransferDto.amount,
        currency: createTransferDto.currency,
        description: createTransferDto.description,
        sourceAccountId: createTransferDto.sourceAccountId,
        destinationAccountId: createTransferDto.destinationAccountId,
        reference: createTransferDto.reference,
        source: TransactionSource.INTERNAL,
        initiatedBy: createTransferDto.initiatedBy,
        metadata: createTransferDto.metadata,
      });

      this.logger.log(`Transfer created successfully: ${result.transactionId}`);
      return result;
    } catch (error) {
      this.logger.error(`Transfer creation failed: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transfer by ID',
    description: 'Retrieves transfer details by transaction ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Transfer transaction ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transfer retrieved successfully',
    type: TransactionResultDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transfer not found',
  })
  async getTransfer(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TransactionResultDto | null> {
    const result = await this.transactionProcessor.getTransactionStatus(id);
    
    if (!result) {
      throw new NotFoundException('Transfer not found');
    }

    return result;
  }

  @Post(':id/confirm')
  @ApiOperation({
    summary: 'Confirm transfer',
    description: 'Confirms a pending transfer (placeholder for future implementation)',
  })
  @ApiParam({
    name: 'id',
    description: 'Transfer transaction ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transfer confirmed successfully',
  })
  async confirmTransfer(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<{ message: string; transferId: string }> {
    // For now, this is a placeholder
    // In a real implementation, this might update the status of a pending transfer
    this.logger.log(`Transfer confirmation requested for: ${id}`);
    
    return {
      message: 'Transfer confirmation is not required for internal transfers',
      transferId: id,
    };
  }
}