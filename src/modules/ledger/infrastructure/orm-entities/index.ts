// Import entities first
import { LedgerAccountOrmEntity } from './ledger-account.entity';
import { TransactionOrmEntity } from './transaction.entity';
import { TransactionEntryOrmEntity } from './transaction-entry.entity';
import { BalanceSnapshotOrmEntity } from './balance-snapshot.entity';
import { ReconciliationLogOrmEntity } from './reconciliation-log.entity';

// Re-export entities
export { LedgerAccountOrmEntity } from './ledger-account.entity';
export { TransactionOrmEntity } from './transaction.entity';
export { TransactionEntryOrmEntity } from './transaction-entry.entity';
export { BalanceSnapshotOrmEntity } from './balance-snapshot.entity';
export { ReconciliationLogOrmEntity } from './reconciliation-log.entity';

// Export enums from ledger-account.entity
export { AccountType, AccountStatus, NormalBalance } from './ledger-account.entity';

// Export enums from transaction.entity
export { TransactionType, TransactionStatus, TransactionSource, ComplianceStatus } from './transaction.entity';

// Export enums from transaction-entry.entity
export { EntryType } from './transaction-entry.entity';

// Export enums from balance-snapshot.entity
export { SnapshotType } from './balance-snapshot.entity';

// Export enums from reconciliation-log.entity
export { ReconciliationType, ReconciliationStatus, ResolutionAction, BlnkSyncStatus } from './reconciliation-log.entity';

export const OrmEntities = [
  LedgerAccountOrmEntity,
  TransactionOrmEntity,
  TransactionEntryOrmEntity,
  BalanceSnapshotOrmEntity,
  ReconciliationLogOrmEntity,
];
