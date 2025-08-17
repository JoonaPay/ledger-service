"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLedgerAccountsTable1755218300000 = void 0;
const typeorm_1 = require("typeorm");
class CreateLedgerAccountsTable1755218300000 {
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.createTable(new typeorm_1.Table({
            name: "ledger_accounts",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()",
                },
                {
                    name: "identity_account_id",
                    type: "uuid",
                },
                {
                    name: "user_id",
                    type: "uuid",
                },
                {
                    name: "account_name",
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "account_type",
                    type: "enum",
                    enum: ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"],
                    default: "'ASSET'",
                },
                {
                    name: "currency",
                    type: "varchar",
                    length: "3",
                },
                {
                    name: "balance",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                    default: "0.0000",
                },
                {
                    name: "credit_balance",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                    default: "0.0000",
                },
                {
                    name: "debit_balance",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                    default: "0.0000",
                },
                {
                    name: "blnk_account_id",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                },
                {
                    name: "parent_account_id",
                    type: "uuid",
                    isNullable: true,
                },
                {
                    name: "account_level",
                    type: "integer",
                    default: 1,
                },
                {
                    name: "is_contra",
                    type: "boolean",
                    default: false,
                },
                {
                    name: "normal_balance",
                    type: "enum",
                    enum: ["DEBIT", "CREDIT"],
                    default: "'DEBIT'",
                },
                {
                    name: "metadata",
                    type: "jsonb",
                    isNullable: true,
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["ACTIVE", "SUSPENDED", "CLOSED"],
                    default: "'ACTIVE'",
                },
                {
                    name: "is_active",
                    type: "boolean",
                    default: true,
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
                {
                    name: "deleted_at",
                    type: "timestamp",
                    isNullable: true,
                },
            ],
            indices: [
                new typeorm_1.Index({
                    name: "IDX_LEDGER_ACCOUNTS_IDENTITY_ACCOUNT_ID",
                    columnNames: ["identity_account_id"],
                }),
                new typeorm_1.Index({
                    name: "IDX_LEDGER_ACCOUNTS_USER_ID",
                    columnNames: ["user_id"],
                }),
                new typeorm_1.Index({
                    name: "IDX_LEDGER_ACCOUNTS_TYPE",
                    columnNames: ["account_type"],
                }),
                new typeorm_1.Index({
                    name: "IDX_LEDGER_ACCOUNTS_CURRENCY",
                    columnNames: ["currency"],
                }),
                new typeorm_1.Index({
                    name: "IDX_LEDGER_ACCOUNTS_BLNK_ID",
                    columnNames: ["blnk_account_id"],
                }),
                new typeorm_1.Index({
                    name: "IDX_LEDGER_ACCOUNTS_PARENT",
                    columnNames: ["parent_account_id"],
                }),
                new typeorm_1.Index({
                    name: "IDX_LEDGER_ACCOUNTS_STATUS",
                    columnNames: ["status"],
                }),
                new typeorm_1.Index({
                    name: "IDX_LEDGER_ACCOUNTS_ACTIVE",
                    columnNames: ["is_active", "deleted_at"],
                }),
            ],
        }), true);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
        await queryRunner.query(`
      CREATE TRIGGER update_ledger_accounts_updated_at 
      BEFORE UPDATE ON ledger_accounts 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_ledger_accounts_updated_at ON ledger_accounts`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
        await queryRunner.dropTable("ledger_accounts");
    }
}
exports.CreateLedgerAccountsTable1755218300000 = CreateLedgerAccountsTable1755218300000;
//# sourceMappingURL=1755218300000-create_ledger_accounts_table.js.map