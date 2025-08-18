import { ApiProperty } from "@nestjs/swagger";
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsObject,
} from "class-validator";
import { AccountType, NormalBalance } from '@modules/ledger/infrastructure/orm-entities';

export class CreateAccountDto {
  @ApiProperty({ description: 'Identity account ID' })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  identity_account_id: string;

  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  user_id: string;

  @ApiProperty({ description: 'Account name' })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  account_name: string;

  @ApiProperty({ enum: AccountType, description: 'Account type' })
  @IsEnum(AccountType)
  @IsNotEmpty()
  @IsDefined()
  account_type: AccountType;

  @ApiProperty({ description: 'Currency code (ISO 4217)' })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  currency: string;

  @ApiProperty({ enum: NormalBalance, description: 'Normal balance type' })
  @IsEnum(NormalBalance)
  @IsNotEmpty()
  @IsDefined()
  normal_balance: NormalBalance;

  @ApiProperty({ description: 'Parent account ID', required: false })
  @IsUUID()
  @IsOptional()
  parent_account_id?: string;

  @ApiProperty({ description: 'Account number', required: false })
  @IsString()
  @IsOptional()
  account_number?: string;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}