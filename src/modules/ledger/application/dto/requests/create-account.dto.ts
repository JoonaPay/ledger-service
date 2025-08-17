import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID, IsNumber, IsObject, Length, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '../../../infrastructure/orm-entities';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Identity service account ID',
    example: 'acc_123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  identityAccountId: string;

  @ApiProperty({
    description: 'User ID from identity service',
    example: 'user_123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Account name',
    example: 'John Doe Main Account',
    minLength: 1,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  accountName: string;

  @ApiProperty({
    description: 'Account type',
    enum: AccountType,
    example: AccountType.ASSET,
  })
  @IsEnum(AccountType)
  accountType: AccountType;

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

  @ApiPropertyOptional({
    description: 'Initial balance',
    example: 100.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  initialBalance?: number;

  @ApiPropertyOptional({
    description: 'Parent account ID for hierarchical accounts',
    example: 'acc_parent123-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  parentAccountId?: string;

  @ApiPropertyOptional({
    description: 'Account level in hierarchy',
    example: 1,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  accountLevel?: number;

  @ApiPropertyOptional({
    description: 'Whether this is a contra account',
    example: false,
  })
  @IsOptional()
  isContra?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata for the account',
    example: { purpose: 'savings', category: 'personal' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}