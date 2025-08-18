# Ledger Service

## 💰 Overview

The Ledger Service is the core financial accounting engine of the JoonaPay platform, providing enterprise-grade double-entry bookkeeping, multi-currency transaction processing, and real-time balance management. Built on proven accounting principles, it ensures ACID compliance, complete audit trails, and regulatory compliance for all financial operations.

## 🎯 Key Features

### Double-Entry Bookkeeping
- **ACID Compliant**: All transactions are atomic, consistent, isolated, and durable
- **Balanced Entries**: Every debit has a corresponding credit, ensuring accounting integrity
- **Journal Entries**: Complete transaction history with immutable audit trail
- **Trial Balance**: Real-time balance verification across all accounts

### Account Management
- **Chart of Accounts**: Hierarchical account structure with standard classifications
  - Assets, Liabilities, Equity, Revenue, Expenses
- **Multi-Currency Support**: Native handling of multiple currencies with exchange rates
- **Account Types**: Current, Savings, Loan, Credit, Investment, etc.
- **Balance Tracking**: Real-time balance calculation with overdraft protection
- **Account Lifecycle**: Active → Suspended → Closed with proper state transitions

### Transaction Processing
- **Atomic Operations**: All-or-nothing transaction processing
- **Batch Processing**: Bulk transaction support for high-volume operations
- **Transaction Types**: Transfer, Deposit, Withdrawal, Fee, Interest, Adjustment
- **Approval Workflows**: Multi-level approval for high-value transactions
- **Reversals**: Complete reversal and adjustment capabilities

### Financial Controls
- **Balance Reconciliation**: Automated and manual reconciliation processes
- **Overdraft Protection**: Configurable limits and automatic rejection
- **Transaction Limits**: Daily, monthly, and per-transaction limits
- **Audit Trail**: Complete history of all financial movements
- **Regulatory Compliance**: Built-in support for financial regulations

## 🚀 Getting Started

### Prerequisites
```bash
- Node.js 18+
- PostgreSQL 14+
- Redis (for caching)
- Docker (optional)
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JoonaPay/ledger-service.git
cd ledger-service
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database and service configurations
```

4. Run database migrations:
```bash
npm run migration:run
```

5. Start the service:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Documentation

### Authentication
All API requests require JWT authentication:
```bash
Authorization: Bearer <jwt_token>
```

### Core Endpoints

#### Account Management
```typescript
POST   /api/accounts                   // Create new account
GET    /api/accounts                   // List accounts
GET    /api/accounts/:id               // Get account details
PUT    /api/accounts/:id               // Update account
GET    /api/accounts/:id/balance       // Get real-time balance
POST   /api/accounts/:id/suspend       // Suspend account
POST   /api/accounts/:id/close         // Close account
```

#### Transaction Processing
```typescript
POST   /api/transactions               // Process transaction
GET    /api/transactions               // List transactions
GET    /api/transactions/:id           // Get transaction details
POST   /api/transactions/batch         // Batch transaction processing
POST   /api/transactions/:id/reverse   // Reverse transaction
POST   /api/transactions/:id/approve   // Approve pending transaction
```

#### Balance & Reconciliation
```typescript
GET    /api/balances/snapshot          // Get balance snapshot
POST   /api/reconciliation/start       // Start reconciliation
GET    /api/reconciliation/:id         // Get reconciliation status
GET    /api/reports/trial-balance      // Generate trial balance
GET    /api/reports/ledger            // Get general ledger
```

## 🏗️ Architecture

### Domain-Driven Design (DDD)
```
src/
├── modules/
│   ├── account/
│   │   ├── domain/           # Account entity & business logic
│   │   ├── application/      # Use cases & DTOs
│   │   └── infrastructure/   # Database & repositories
│   ├── transaction/
│   │   ├── domain/           # Transaction processing logic
│   │   ├── application/      # Transaction workflows
│   │   └── infrastructure/   # Transaction persistence
│   └── transaction-entry/
│       ├── domain/           # Journal entries
│       └── infrastructure/   # Entry persistence
└── core/                      # Shared kernel & utilities
```

### Key Domain Entities

#### Account Entity
```typescript
class AccountEntity {
  id: string;
  accountNumber: string;
  type: AccountType;
  subType: AccountSubType;
  currency: Currency;
  balance: Decimal;
  availableBalance: Decimal;
  status: AccountStatus;
  limits: AccountLimits;
  metadata: AccountMetadata;
  
  // Business Methods
  debit(amount: Decimal): void;
  credit(amount: Decimal): void;
  suspend(): void;
  close(): void;
  calculateBalance(): Decimal;
}
```

#### Transaction Entity
```typescript
class TransactionEntity {
  id: string;
  reference: string;
  type: TransactionType;
  amount: Decimal;
  currency: Currency;
  status: TransactionStatus;
  entries: TransactionEntry[];
  
  // Business Methods
  process(): void;
  approve(): void;
  reject(): void;
  reverse(): void;
  validateBalance(): boolean;
}
```

## 🔄 Double-Entry System

### Transaction Flow
```
Customer Transfer: $100 from Account A to Account B

Journal Entries:
┌────────────────┬─────────┬──────────┐
│ Account        │ Debit   │ Credit   │
├────────────────┼─────────┼──────────┤
│ Account A      │ $100    │          │
│ Account B      │         │ $100     │
└────────────────┴─────────┴──────────┘

Result: Debits ($100) = Credits ($100) ✓
```

### Account Types & Normal Balances
- **Assets**: Debit balance (increases with debits)
- **Liabilities**: Credit balance (increases with credits)
- **Equity**: Credit balance (increases with credits)
- **Revenue**: Credit balance (increases with credits)
- **Expenses**: Debit balance (increases with debits)

## 🔐 Security & Compliance

### Financial Controls
- **Segregation of Duties**: Separate roles for creation, approval, and processing
- **Dual Control**: High-value transactions require multiple approvals
- **Audit Trail**: Immutable transaction history with timestamps and user tracking
- **Data Encryption**: All sensitive financial data encrypted at rest and in transit

### Regulatory Compliance
- **PCI DSS**: Payment card industry data security standards
- **SOX**: Sarbanes-Oxley compliance for financial reporting
- **GDPR**: Data protection and privacy compliance
- **AML**: Anti-money laundering transaction monitoring

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics` (Prometheus format)
- **OpenAPI Spec**: `GET /api-docs`

### Key Metrics
- Transaction volume and success rate
- Account balance distribution
- Processing time percentiles
- Error rates by transaction type
- Daily/monthly transaction summaries

## 🚢 Deployment

### Docker
```bash
docker build -t ledger-service .
docker run -p 3000:3000 ledger-service
```

### Kubernetes
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

## 🔄 Event-Driven Integration

### Published Events
- `AccountCreated`
- `AccountSuspended`
- `AccountClosed`
- `TransactionProcessed`
- `TransactionReversed`
- `BalanceUpdated`
- `ReconciliationCompleted`

### Consumed Events
- `UserCreated` (from Identity Service)
- `BusinessEntityCreated` (from Business Entity Service)
- `ComplianceCheckCompleted` (from Compliance Service)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the JoonaPay platform and is proprietary software.

## 🔗 Related Services

- [Business Entity Service](https://github.com/JoonaPay/business-entity-service)
- [Identity Manager Service](https://github.com/JoonaPay/identity-manager-service)
- [Compliance Service](https://github.com/JoonaPay/compliance-service)
- [AML Risk Manager Service](https://github.com/JoonaPay/aml-risk-manager-service)

## 📞 Support

For questions and support, please contact the JoonaPay engineering team.

---

Built with ❤️ by the JoonaPay Team