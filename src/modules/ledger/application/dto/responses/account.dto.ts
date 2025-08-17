import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType, AccountStatus, NormalBalance } from '../../../infrastructure/orm-entities';

export class AccountDto {
  @ApiProperty({
    description: 'Account ID',
    example: 'acc_123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Identity service account ID',
    example: 'identity_acc_123e4567-e89b-12d3-a456-426614174000',
  })
  identityAccountId: string;

  @ApiProperty({
    description: 'User ID',
    example: 'user_123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Account name',
    example: 'John Doe Main Account',
  })
  accountName: string;

  @ApiProperty({
    description: 'Account type',
    enum: AccountType,
    example: AccountType.ASSET,
  })
  accountType: AccountType;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Current balance',
    example: 1250.75,
  })
  balance: number;

  @ApiProperty({
    description: 'Total credit balance',
    example: 5000.00,
  })
  creditBalance: number;

  @ApiProperty({
    description: 'Total debit balance',
    example: 3749.25,
  })
  debitBalance: number;

  @ApiPropertyOptional({
    description: 'BlnkFinance account ID',
    example: 'blnk_acc_789',
  })
  blnkAccountId?: string;

  @ApiPropertyOptional({
    description: 'Parent account ID',
    example: 'acc_parent123-e89b-12d3-a456-426614174000',
  })
  parentAccountId?: string;

  @ApiProperty({
    description: 'Account level in hierarchy',
    example: 1,
  })
  accountLevel: number;

  @ApiProperty({
    description: 'Whether this is a contra account',
    example: false,
  })
  isContra: boolean;

  @ApiProperty({
    description: 'Normal balance type',
    enum: NormalBalance,
    example: NormalBalance.DEBIT,
  })
  normalBalance: NormalBalance;

  @ApiProperty({
    description: 'Account status',
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @ApiProperty({
    description: 'Whether the account is active',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { purpose: 'savings', category: 'personal' },
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Account last update date',
    example: '2024-01-01T10:00:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Account deletion date (if soft deleted)',
    example: null,
  })
  deletedAt?: Date;
}

export class AccountBalanceDto {
  @ApiProperty({
    description: 'Account ID',
    example: 'acc_123e4567-e89b-12d3-a456-426614174000',
  })
  accountId: string;

  @ApiProperty({
    description: 'Current balance',
    example: 1250.75,
  })
  currentBalance: number;

  @ApiProperty({
    description: 'Available balance (after pending transactions)',
    example: 1200.75,
  })
  availableBalance: number;

  @ApiProperty({
    description: 'Pending balance (transactions in process)',
    example: 50.00,
  })
  pendingBalance: number;

  @ApiProperty({
    description: 'Total debits',
    example: 3749.25,
  })
  totalDebits: number;

  @ApiProperty({
    description: 'Total credits',
    example: 5000.00,
  })
  totalCredits: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T10:00:00Z',
  })
  lastUpdated: Date;
}

export class AccountStatementDto {
  @ApiProperty({
    description: 'Account ID',
    example: 'acc_123e4567-e89b-12d3-a456-426614174000',
  })
  accountId: string;

  @ApiProperty({
    description: 'Statement period start',
    example: '2024-01-01T00:00:00Z',
  })
  periodStart: Date;

  @ApiProperty({
    description: 'Statement period end',
    example: '2024-01-31T23:59:59Z',
  })
  periodEnd: Date;

  @ApiProperty({
    description: 'Opening balance',
    example: 1000.00,
  })
  openingBalance: number;

  @ApiProperty({
    description: 'Closing balance',
    example: 1250.75,
  })
  closingBalance: number;

  @ApiProperty({
    description: 'Total debits in period',
    example: 500.00,
  })
  totalDebits: number;

  @ApiProperty({
    description: 'Total credits in period',
    example: 750.75,
  })
  totalCredits: number;

  @ApiProperty({
    description: 'Number of transactions',
    example: 15,
  })
  transactionCount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Statement transactions',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        transactionId: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        amount: { type: 'number' },
        type: { type: 'string' },
        description: { type: 'string' },
        balance: { type: 'number' },
      },
    },
  })
  transactions: Array<{
    transactionId: string;
    date: Date;
    amount: number;
    type: 'debit' | 'credit';
    description: string;
    balance: number;
  }>;
}