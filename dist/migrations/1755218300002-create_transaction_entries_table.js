"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionEntriesTable1755218300002 = void 0;
const typeorm_1 = require("typeorm");
class CreateTransactionEntriesTable1755218300002 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "transaction_entries",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()",
                },
                {
                    name: "transaction_id",
                    type: "uuid",
                },
                {
                    name: "account_id",
                    type: "uuid",
                },
                {
                    name: "entry_type",
                    type: "enum",
                    enum: ["DEBIT", "CREDIT"],
                },
                {
                    name: "amount",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                },
                {
                    name: "currency",
                    type: "varchar",
                    length: "3",
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "balance_before",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                },
                {
                    name: "balance_after",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                },
                {
                    name: "entry_sequence",
                    type: "integer",
                    comment: "Sequence within the transaction for ordering",
                },
                {
                    name: "reversal_entry_id",
                    type: "uuid",
                    isNullable: true,
                },
                {
                    name: "is_reversal",
                    type: "boolean",
                    default: false,
                },
                {
                    name: "metadata",
                    type: "jsonb",
                    isNullable: true,
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
            ],
            indices: [
                new typeorm_1.Index({
                    name: "IDX_TRANSACTION_ENTRIES_TRANSACTION_ID",
                    columnNames: ["transaction_id"],
                }),
                new typeorm_1.Index({
                    name: "IDX_TRANSACTION_ENTRIES_ACCOUNT_ID",
                    columnNames: ["account_id"],
                }),
                new typeorm_1.Index({
                    name: "IDX_TRANSACTION_ENTRIES_TYPE",
                    columnNames: ["entry_type"],
                }),
                new typeorm_1.Index({
                    name: "IDX_TRANSACTION_ENTRIES_CURRENCY",
                    columnNames: ["currency"],
                }),
                new typeorm_1.Index({
                    name: "IDX_TRANSACTION_ENTRIES_CREATED_AT",
                    columnNames: ["created_at"],
                }),
                new typeorm_1.Index({
                    name: "IDX_TRANSACTION_ENTRIES_REVERSAL",
                    columnNames: ["is_reversal", "reversal_entry_id"],
                }),
                new typeorm_1.Index({
                    name: "IDX_TRANSACTION_ENTRIES_SEQUENCE",
                    columnNames: ["transaction_id", "entry_sequence"],
                }),
            ],
            foreignKeys: [
                new typeorm_1.ForeignKey({
                    name: "FK_TRANSACTION_ENTRIES_TRANSACTION_ID",
                    columnNames: ["transaction_id"],
                    referencedTableName: "transactions",
                    referencedColumnNames: ["id"],
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                }),
                new typeorm_1.ForeignKey({
                    name: "FK_TRANSACTION_ENTRIES_ACCOUNT_ID",
                    columnNames: ["account_id"],
                    referencedTableName: "ledger_accounts",
                    referencedColumnNames: ["id"],
                    onDelete: "RESTRICT",
                    onUpdate: "CASCADE",
                }),
            ],
        }), true);
        await queryRunner.query(`
      CREATE TRIGGER update_transaction_entries_updated_at 
      BEFORE UPDATE ON transaction_entries 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION validate_transaction_balance()
      RETURNS TRIGGER AS $$
      DECLARE
        total_debits DECIMAL(19,4);
        total_credits DECIMAL(19,4);
        entry_count INTEGER;
      BEGIN
        -- Get totals for this transaction
        SELECT 
          COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END), 0),
          COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END), 0),
          COUNT(*)
        INTO total_debits, total_credits, entry_count
        FROM transaction_entries 
        WHERE transaction_id = NEW.transaction_id;
        
        -- Validate that debits equal credits (allow small rounding differences)
        IF ABS(total_debits - total_credits) > 0.01 THEN
          RAISE EXCEPTION 'Transaction entries must balance: debits=% credits=%', total_debits, total_credits;
        END IF;
        
        -- Ensure at least 2 entries for double-entry
        IF entry_count < 2 THEN
          RAISE EXCEPTION 'Transaction must have at least 2 entries for double-entry bookkeeping';
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
        await queryRunner.query(`
      CREATE TRIGGER validate_transaction_balance_trigger
      AFTER INSERT OR UPDATE ON transaction_entries
      FOR EACH ROW
      EXECUTE FUNCTION validate_transaction_balance();
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TRIGGER IF EXISTS validate_transaction_balance_trigger ON transaction_entries`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_transaction_entries_updated_at ON transaction_entries`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS validate_transaction_balance`);
        await queryRunner.dropTable("transaction_entries");
    }
}
exports.CreateTransactionEntriesTable1755218300002 = CreateTransactionEntriesTable1755218300002;
//# sourceMappingURL=1755218300002-create_transaction_entries_table.js.map