import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID, IsNumber, IsObject, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, TransactionSource } from '../../../infrastructure/orm-entities';

export class ProcessTransactionDto {
  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.TRANSFER,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction amount',
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
    description: 'Transaction description',
    example: 'Payment for services',
    minLength: 1,
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  description: string;

  @ApiPropertyOptional({
    description: 'Source account ID (for withdrawals and transfers)',
    example: 'acc_123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  sourceAccountId?: string;

  @ApiPropertyOptional({
    description: 'Destination account ID (for deposits and transfers)',
    example: 'acc_789e4567-e89b-12d3-a456-426614174999',
  })
  @IsOptional()
  @IsUUID()
  destinationAccountId?: string;

  @ApiPropertyOptional({
    description: 'Transaction reference (auto-generated if not provided)',
    example: 'TXN20240101001',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  reference?: string;

  @ApiPropertyOptional({
    description: 'External reference from source system',
    example: 'EXT_REF_12345',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  externalReference?: string;

  @ApiPropertyOptional({
    description: 'Transaction source',
    enum: TransactionSource,
    example: TransactionSource.API,
  })
  @IsOptional()
  @IsEnum(TransactionSource)
  source?: TransactionSource;

  @ApiPropertyOptional({
    description: 'User or system that initiated the transaction',
    example: 'user_123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  initiatedBy?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the transaction',
    example: { category: 'payment', orderId: 'ORD-12345' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ReverseTransactionDto {
  @ApiProperty({
    description: 'Reason for reversal',
    example: 'Customer requested refund',
    minLength: 1,
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  reason: string;

  @ApiPropertyOptional({
    description: 'User or system that initiated the reversal',
    example: 'user_123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  initiatedBy?: string;
}