"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBalanceSnapshotsTable1755218300003 = void 0;
const typeorm_1 = require("typeorm");
class CreateBalanceSnapshotsTable1755218300003 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "balance_snapshots",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()",
                },
                {
                    name: "account_id",
                    type: "uuid",
                },
                {
                    name: "snapshot_date",
                    type: "date",
                },
                {
                    name: "snapshot_time",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
                {
                    name: "opening_balance",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                },
                {
                    name: "closing_balance",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                },
                {
                    name: "total_debits",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                    default: "0.0000",
                },
                {
                    name: "total_credits",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                    default: "0.0000",
                },
                {
                    name: "transaction_count",
                    type: "integer",
                    default: 0,
                },
                {
                    name: "currency",
                    type: "varchar",
                    length: "3",
                },
                {
                    name: "snapshot_type",
                    type: "enum",
                    enum: ["DAILY", "MONTHLY", "YEARLY", "MANUAL", "RECONCILIATION"],
                    default: "'DAILY'",
                },
                {
                    name: "is_reconciled",
                    type: "boolean",
                    default: false,
                },
                {
                    name: "reconciled_at",
                    type: "timestamp",
                    isNullable: true,
                },
                {
                    name: "reconciled_by",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                },
                {
                    name: "variance_amount",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                    default: "0.0000",
                },
                {
                    name: "variance_reason",
                    type: "text",
                    isNullable: true,
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
                    name: "IDX_BALANCE_SNAPSHOTS_ACCOUNT_ID",
                    columnNames: ["account_id"],
                }),
                new typeorm_1.Index({
                    name: "IDX_BALANCE_SNAPSHOTS_DATE",
                    columnNames: ["snapshot_date"],
                }),
                new typeorm_1.Index({
                    name: "IDX_BALANCE_SNAPSHOTS_TYPE",
                    columnNames: ["snapshot_type"],
                }),
                new typeorm_1.Index({
                    name: "IDX_BALANCE_SNAPSHOTS_CURRENCY",
                    columnNames: ["currency"],
                }),
                new typeorm_1.Index({
                    name: "IDX_BALANCE_SNAPSHOTS_RECONCILED",
                    columnNames: ["is_reconciled"],
                }),
                new typeorm_1.Index({
                    name: "IDX_BALANCE_SNAPSHOTS_ACCOUNT_DATE",
                    columnNames: ["account_id", "snapshot_date"],
                    isUnique: true,
                }),
                new typeorm_1.Index({
                    name: "IDX_BALANCE_SNAPSHOTS_CREATED_AT",
                    columnNames: ["created_at"],
                }),
            ],
            foreignKeys: [
                new typeorm_1.ForeignKey({
                    name: "FK_BALANCE_SNAPSHOTS_ACCOUNT_ID",
                    columnNames: ["account_id"],
                    referencedTableName: "ledger_accounts",
                    referencedColumnNames: ["id"],
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                }),
            ],
        }), true);
        await queryRunner.query(`
      CREATE TRIGGER update_balance_snapshots_updated_at 
      BEFORE UPDATE ON balance_snapshots 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION generate_daily_balance_snapshot(
        p_account_id UUID,
        p_snapshot_date DATE DEFAULT CURRENT_DATE
      )
      RETURNS UUID AS $$
      DECLARE
        v_opening_balance DECIMAL(19,4);
        v_closing_balance DECIMAL(19,4);
        v_total_debits DECIMAL(19,4);
        v_total_credits DECIMAL(19,4);
        v_transaction_count INTEGER;
        v_currency VARCHAR(3);
        v_snapshot_id UUID;
        v_previous_date DATE;
      BEGIN
        -- Get account currency
        SELECT currency INTO v_currency 
        FROM ledger_accounts 
        WHERE id = p_account_id;
        
        IF v_currency IS NULL THEN
          RAISE EXCEPTION 'Account not found: %', p_account_id;
        END IF;
        
        -- Get previous business day
        v_previous_date := p_snapshot_date - INTERVAL '1 day';
        
        -- Get opening balance (closing balance from previous day or account balance)
        SELECT COALESCE(closing_balance, 0) INTO v_opening_balance
        FROM balance_snapshots
        WHERE account_id = p_account_id 
          AND snapshot_date = v_previous_date
        ORDER BY snapshot_time DESC
        LIMIT 1;
        
        -- If no previous snapshot, use current account balance minus today's transactions
        IF v_opening_balance IS NULL THEN
          SELECT balance INTO v_opening_balance
          FROM ledger_accounts
          WHERE id = p_account_id;
          
          -- Subtract today's net transactions to get opening balance
          SELECT COALESCE(SUM(
            CASE 
              WHEN te.entry_type = 'DEBIT' THEN -te.amount
              WHEN te.entry_type = 'CREDIT' THEN te.amount
              ELSE 0
            END
          ), 0) INTO v_closing_balance
          FROM transaction_entries te
          JOIN transactions t ON te.transaction_id = t.id
          WHERE te.account_id = p_account_id
            AND DATE(t.created_at) = p_snapshot_date
            AND t.status = 'COMPLETED';
            
          v_opening_balance := v_opening_balance - v_closing_balance;
        END IF;
        
        -- Calculate totals for the day
        SELECT 
          COALESCE(SUM(CASE WHEN te.entry_type = 'DEBIT' THEN te.amount ELSE 0 END), 0),
          COALESCE(SUM(CASE WHEN te.entry_type = 'CREDIT' THEN te.amount ELSE 0 END), 0),
          COUNT(DISTINCT t.id)
        INTO v_total_debits, v_total_credits, v_transaction_count
        FROM transaction_entries te
        JOIN transactions t ON te.transaction_id = t.id
        WHERE te.account_id = p_account_id
          AND DATE(t.created_at) = p_snapshot_date
          AND t.status = 'COMPLETED';
        
        -- Calculate closing balance
        v_closing_balance := v_opening_balance + v_total_credits - v_total_debits;
        
        -- Insert or update snapshot
        INSERT INTO balance_snapshots (
          account_id,
          snapshot_date,
          opening_balance,
          closing_balance,
          total_debits,
          total_credits,
          transaction_count,
          currency,
          snapshot_type
        ) VALUES (
          p_account_id,
          p_snapshot_date,
          v_opening_balance,
          v_closing_balance,
          v_total_debits,
          v_total_credits,
          v_transaction_count,
          v_currency,
          'DAILY'
        )
        ON CONFLICT (account_id, snapshot_date)
        DO UPDATE SET
          closing_balance = EXCLUDED.closing_balance,
          total_debits = EXCLUDED.total_debits,
          total_credits = EXCLUDED.total_credits,
          transaction_count = EXCLUDED.transaction_count,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id INTO v_snapshot_id;
        
        RETURN v_snapshot_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
        --Create;
        function to() { }
        auto - generate;
        snapshots;
        for (all; accounts; await queryRunner.query(`
      CREATE OR REPLACE FUNCTION generate_all_daily_snapshots(
        p_snapshot_date DATE DEFAULT CURRENT_DATE
      )
      RETURNS INTEGER AS $$
      DECLARE
        v_account_record RECORD;
        v_snapshot_count INTEGER := 0;
      BEGIN
        FOR v_account_record IN 
          SELECT id FROM ledger_accounts WHERE is_active = true AND deleted_at IS NULL
        LOOP
          PERFORM generate_daily_balance_snapshot(v_account_record.id, p_snapshot_date);
          v_snapshot_count := v_snapshot_count + 1;
        END LOOP;
        
        RETURN v_snapshot_count;
      END;
      $$ LANGUAGE plpgsql;
    `))
            ;
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_balance_snapshots_updated_at ON balance_snapshots`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS generate_all_daily_snapshots`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS generate_daily_balance_snapshot`);
        await queryRunner.dropTable("balance_snapshots");
    }
}
exports.CreateBalanceSnapshotsTable1755218300003 = CreateBalanceSnapshotsTable1755218300003;
//# sourceMappingURL=1755218300003-create_balance_snapshots_table.js.map