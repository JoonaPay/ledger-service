import { LedgerService } from './ledger.service';
import { DoubleEntryService } from './double-entry.service';
import { BalanceService } from './balance.service';
import { TransactionProcessorService } from './transaction-processor.service';
import { CurrencyService } from './currency.service';

export const Services = [
  LedgerService,
  DoubleEntryService,
  BalanceService,
  TransactionProcessorService,
  CurrencyService,
];
