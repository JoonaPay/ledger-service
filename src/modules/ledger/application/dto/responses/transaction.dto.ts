import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, TransactionStatus, TransactionSource, ComplianceStatus } from '../../../infrastructure/orm-entities';

export class TransactionEntryDto {
  @ApiProperty({
    description: 'Account ID',
    example: 'acc_123e4567-e89b-12d3-a456-426614174000',
  })
  accountId: string;

  @ApiProperty({
    description: 'Entry amount',
    example: 100.50,
  })
  amount: number;

  @ApiProperty({
    description: 'Entry type',
    enum: ['debit', 'credit'],
    example: 'debit',
  })
  type: 'debit' | 'credit';

  @ApiProperty({
    description: 'Balance before this entry',
    example: 500.00,
  })
  balanceBefore: number;

  @ApiProperty({
    description: 'Balance after this entry',
    example: 600.50,
  })
  balanceAfter: number;

  @ApiPropertyOptional({
    description: 'Entry description',
    example: 'Payment for services',
  })
  description?: string;
}

export class TransactionDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'txn_123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Transaction reference',
    example: 'TXN20240101001',
  })
  transactionReference: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.TRANSFER,
  })
  transactionType: TransactionType;

  @ApiProperty({
    description: 'Transaction amount',
    example: 100.50,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Payment for services',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Source account ID',
    example: 'acc_123e4567-e89b-12d3-a456-426614174000',
  })
  accountId?: string;

  @ApiPropertyOptional({
    description: 'Destination account ID',
    example: 'acc_789e4567-e89b-12d3-a456-426614174999',
  })
  counterpartyAccountId?: string;

  @ApiPropertyOptional({
    description: 'Counterparty name',
    example: 'John Doe',
  })
  counterpartyName?: string;

  @ApiPropertyOptional({
    description: 'BlnkFinance transaction ID',
    example: 'blnk_txn_456',
  })
  blnkTransactionId?: string;

  @ApiPropertyOptional({
    description: 'External reference',
    example: 'EXT_REF_12345',
  })
  externalReference?: string;

  @ApiProperty({
    description: 'Transaction source',
    enum: TransactionSource,
    example: TransactionSource.API,
  })
  source: TransactionSource;

  @ApiProperty({
    description: 'Transaction status',
    enum: TransactionStatus,
    example: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'Balance before transaction',
    example: 500.00,
  })
  balanceBefore: number;

  @ApiProperty({
    description: 'Balance after transaction',
    example: 600.50,
  })
  balanceAfter: number;

  @ApiPropertyOptional({
    description: 'Fee amount',
    example: 2.50,
  })
  feeAmount?: number;

  @ApiPropertyOptional({
    description: 'Exchange rate (for currency conversions)',
    example: 1.0865,
  })
  exchangeRate?: number;

  @ApiPropertyOptional({
    description: 'Settlement date',
    example: '2024-01-01T10:00:00Z',
  })
  settlementDate?: Date;

  @ApiProperty({
    description: 'Value date',
    example: '2024-01-01T10:00:00Z',
  })
  valueDate: Date;

  @ApiPropertyOptional({
    description: 'Risk score',
    example: 15.5,
  })
  riskScore?: number;

  @ApiProperty({
    description: 'Compliance status',
    enum: ComplianceStatus,
    example: ComplianceStatus.CLEAN,
  })
  complianceStatus: ComplianceStatus;

  @ApiPropertyOptional({
    description: 'Transaction metadata',
    example: { category: 'payment', orderId: 'ORD-12345' },
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Processing completion time',
    example: '2024-01-01T10:00:00Z',
  })
  processedAt?: Date;

  @ApiPropertyOptional({
    description: 'Failure reason (if failed)',
    example: 'Insufficient funds',
  })
  failedReason?: string;

  @ApiPropertyOptional({
    description: 'Reversal transaction ID',
    example: 'txn_reversal_123',
  })
  reversalTransactionId?: string;

  @ApiProperty({
    description: 'Whether this is a reversal transaction',
    example: false,
  })
  isReversal: boolean;

  @ApiProperty({
    description: 'Transaction creation date',
    example: '2024-01-01T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Transaction last update date',
    example: '2024-01-01T10:00:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Transaction entries (for double-entry details)',
    type: [TransactionEntryDto],
  })
  entries?: TransactionEntryDto[];
}

export class TransactionResultDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'txn_123e4567-e89b-12d3-a456-426614174000',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Transaction reference',
    example: 'TXN20240101001',
  })
  reference: string;

  @ApiProperty({
    description: 'Transaction status',
    enum: TransactionStatus,
    example: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'Transaction amount',
    example: 100.50,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Source account ID',
    example: 'acc_123e4567-e89b-12d3-a456-426614174000',
  })
  sourceAccountId?: string;

  @ApiPropertyOptional({
    description: 'Destination account ID',
    example: 'acc_789e4567-e89b-12d3-a456-426614174999',
  })
  destinationAccountId?: string;

  @ApiProperty({
    description: 'Transaction entries',
    type: [TransactionEntryDto],
  })
  entries: TransactionEntryDto[];

  @ApiPropertyOptional({
    description: 'Transaction metadata',
    example: { category: 'payment', orderId: 'ORD-12345' },
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Processing completion time',
    example: '2024-01-01T10:00:00Z',
  })
  processedAt?: Date;

  @ApiPropertyOptional({
    description: 'Failure reason (if failed)',
    example: 'Insufficient funds',
  })
  failedReason?: string;
}

export class TransactionSearchResultDto {
  @ApiProperty({
    description: 'List of transactions',
    type: [TransactionDto],
  })
  transactions: TransactionDto[];

  @ApiProperty({
    description: 'Total number of transactions matching criteria',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Number of transactions returned',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Number of transactions skipped',
    example: 0,
  })
  offset: number;
}