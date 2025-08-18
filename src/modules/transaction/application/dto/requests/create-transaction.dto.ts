import { ApiProperty } from "@nestjs/swagger";
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  IsObject,
  IsPositive,
} from "class-validator";
import { TransactionType, TransactionSource } from '@modules/ledger/infrastructure/orm-entities';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Transaction reference number' })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  transaction_reference: string;

  @ApiProperty({ enum: TransactionType, description: 'Transaction type' })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  @IsDefined()
  transaction_type: TransactionType;

  @ApiProperty({ description: 'Transaction amount' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @IsNotEmpty()
  @IsDefined()
  amount: number;

  @ApiProperty({ description: 'Currency code (ISO 4217)' })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  currency: string;

  @ApiProperty({ description: 'Transaction description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Account ID' })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  account_id: string;

  @ApiProperty({ description: 'Counterparty account ID', required: false })
  @IsUUID()
  @IsOptional()
  counterparty_account_id?: string;

  @ApiProperty({ enum: TransactionSource, description: 'Transaction source', required: false })
  @IsEnum(TransactionSource)
  @IsOptional()
  source?: TransactionSource;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}