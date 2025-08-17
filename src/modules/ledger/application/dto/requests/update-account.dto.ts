import { IsOptional, IsString, IsEnum, IsObject, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccountStatus } from '../../../infrastructure/orm-entities';

export class UpdateAccountDto {
  @ApiPropertyOptional({
    description: 'Account name',
    example: 'John Doe Updated Account',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  accountName?: string;

  @ApiPropertyOptional({
    description: 'Account status',
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiPropertyOptional({
    description: 'Additional metadata for the account',
    example: { updated: true, lastModified: '2024-01-01' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}