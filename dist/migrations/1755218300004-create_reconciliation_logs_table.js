"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReconciliationLogsTable1755218300004 = void 0;
const typeorm_1 = require("typeorm");
class CreateReconciliationLogsTable1755218300004 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "reconciliation_logs",
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
                    name: "reconciliation_date",
                    type: "date",
                },
                {
                    name: "reconciliation_type",
                    type: "enum",
                    enum: ["DAILY", "MONTHLY", "MANUAL", "EXTERNAL_BLNK", "BANK_STATEMENT"],
                },
                {
                    name: "external_source",
                    type: "varchar",
                    length: "100",
                    isNullable: true,
                },
                {
                    name: "internal_balance",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                },
                {
                    name: "external_balance",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                },
                {
                    name: "variance_amount",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                    default: "0.0000",
                },
                {
                    name: "variance_percentage",
                    type: "decimal",
                    precision: 8,
                    scale: 4,
                    default: "0.0000",
                },
                {
                    name: "currency",
                    type: "varchar",
                    length: "3",
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["PENDING", "IN_PROGRESS", "RECONCILED", "FAILED", "MANUAL_REVIEW"],
                    default: "'PENDING'",
                },
                {
                    name: "reconciled_by",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                },
                {
                    name: "reconciled_at",
                    type: "timestamp",
                    isNullable: true,
                },
                {
                    name: "variance_reason",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "resolution_notes",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "resolution_action",
                    type: "enum",
                    enum: ["NO_ACTION", "ADJUSTMENT_MADE", "EXTERNAL_CORRECTION", "PENDING_INVESTIGATION"],
                    isNullable: true,
                },
                {
                    name: "adjustment_transaction_id",
                    type: "uuid",
                    isNullable: true,
                },
                {
                    name: "external_reference",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                },
                {
                    name: "blnk_account_id",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                },
                {
                    name: "blnk_balance",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                    isNullable: true,
                },
                {
                    name: "blnk_sync_status",
                    type: "enum",
                    enum: ["SYNCED", "OUT_OF_SYNC", "ERROR", "NOT_APPLICABLE"],
                    default: "'NOT_APPLICABLE'",
                },
                {
                    name: "transaction_count_internal",
                    type: "integer",
                    default: 0,
                },
                {
                    name: "transaction_count_external",
                    type: "integer",
                    default: 0,
                    isNullable: true,
                },
                {
                    name: "last_transaction_id",
                    type: "uuid",
                    isNullable: true,
                },
                {
                    name: "reconciliation_window_start",
                    type: "timestamp",
                    isNullable: true,
                },
                {
                    name: "reconciliation_window_end",
                    type: "timestamp",
                    isNullable: true,
                },
                {
                    name: "tolerance_amount",
                    type: "decimal",
                    precision: 19,
                    scale: 4,
                    default: "0.01",
                },
                {
                    name: "is_within_tolerance",
                    type: "boolean",
                    default: true,
                },
                {
                    name: "requires_attention",
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
                    name: "IDX_RECONCILIATION_LOGS_ACCOUNT_ID",
                    columnNames: ["account_id"],
                }),
                new typeorm_1.Index({
                    name: "IDX_RECONCILIATION_LOGS_DATE",
                    columnNames: ["reconciliation_date"],
                }),
                new typeorm_1.Index({
                    name: "IDX_RECONCILIATION_LOGS_TYPE",
                    columnNames: ["reconciliation_type"],
                }),
                new typeorm_1.Index({
                    name: "IDX_RECONCILIATION_LOGS_STATUS",
                    columnNames: ["status"],
                }),
                new typeorm_1.Index({
                    name: "IDX_RECONCILIATION_LOGS_CURRENCY",
                    columnNames: ["currency"],
                }),
                new typeorm_1.Index({
                    name: "IDX_RECONCILIATION_LOGS_VARIANCE",
                    columnNames: ["variance_amount"],
                }),
                new typeorm_1.Index({
                    name: "IDX_RECONCILIATION_LOGS_TOLERANCE",
                    columnNames: ["is_within_tolerance", "requires_attention"],
                }),
                new typeorm_1.Index({
                    name: "IDX_RECONCILIATION_LOGS_BLNK_STATUS",
                    columnNames: ["blnk_sync_status"],
                }),
                new typeorm_1.Index({
                    name: "IDX_RECONCILIATION_LOGS_EXTERNAL_REF",
                    columnNames: ["external_reference"],
                }),
                new typeorm_1.Index({
                    name: "IDX_RECONCILIATION_LOGS_CREATED_AT",
                    columnNames: ["created_at"],
                }),
                new typeorm_1.Index({
                    name: "IDX_RECONCILIATION_LOGS_ACCOUNT_DATE",
                    columnNames: ["account_id", "reconciliation_date", "reconciliation_type"],
                }),
            ],
            foreignKeys: [
                new typeorm_1.ForeignKey({
                    name: "FK_RECONCILIATION_LOGS_ACCOUNT_ID",
                    columnNames: ["account_id"],
                    referencedTableName: "ledger_accounts",
                    referencedColumnNames: ["id"],
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                }),
                new typeorm_1.ForeignKey({
                    name: "FK_RECONCILIATION_LOGS_ADJUSTMENT_TXN",
                    columnNames: ["adjustment_transaction_id"],
                    referencedTableName: "transactions",
                    referencedColumnNames: ["id"],
                    onDelete: "SET NULL",
                    onUpdate: "CASCADE",
                }),
                new typeorm_1.ForeignKey({
                    name: "FK_RECONCILIATION_LOGS_LAST_TXN",
                    columnNames: ["last_transaction_id"],
                    referencedTableName: "transactions",
                    referencedColumnNames: ["id"],
                    onDelete: "SET NULL",
                    onUpdate: "CASCADE",
                }),
            ],
        }), true);
        await queryRunner.query(`
      CREATE TRIGGER update_reconciliation_logs_updated_at 
      BEFORE UPDATE ON reconciliation_logs 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_reconciliation_variance()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Calculate variance amount
        NEW.variance_amount := NEW.external_balance - NEW.internal_balance;
        
        -- Calculate variance percentage
        IF NEW.internal_balance != 0 THEN
          NEW.variance_percentage := (NEW.variance_amount / ABS(NEW.internal_balance)) * 100;
        ELSE
          NEW.variance_percentage := 0;
        END IF;
        
        -- Check if within tolerance
        NEW.is_within_tolerance := ABS(NEW.variance_amount) <= NEW.tolerance_amount;
        
        -- Set requires attention flag
        NEW.requires_attention := NOT NEW.is_within_tolerance OR NEW.status = 'FAILED';
        
        -- Auto-update status based on variance
        IF NEW.status = 'PENDING' AND NEW.is_within_tolerance THEN
          NEW.status := 'RECONCILED';
          NEW.reconciled_at := CURRENT_TIMESTAMP;
        ELSIF NEW.status = 'PENDING' AND NOT NEW.is_within_tolerance THEN
          NEW.status := 'MANUAL_REVIEW';
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
        await queryRunner.query(`
      CREATE TRIGGER calculate_reconciliation_variance_trigger
      BEFORE INSERT OR UPDATE ON reconciliation_logs
      FOR EACH ROW
      EXECUTE FUNCTION calculate_reconciliation_variance();
    `);
        --Create;
        function to() { }
        perform;
        daily;
        reconciliation;
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION perform_daily_reconciliation(
        p_account_id UUID,
        p_reconciliation_date DATE DEFAULT CURRENT_DATE
      )
      RETURNS UUID AS $$
      DECLARE
        v_internal_balance DECIMAL(19,4);
        v_external_balance DECIMAL(19,4);
        v_currency VARCHAR(3);
        v_blnk_account_id VARCHAR(255);
        v_reconciliation_id UUID;
        v_transaction_count INTEGER;
        v_last_transaction_id UUID;
      BEGIN
        -- Get account information
        SELECT 
          balance, 
          currency, 
          blnk_account_id
        INTO 
          v_internal_balance, 
          v_currency, 
          v_blnk_account_id
        FROM ledger_accounts 
        WHERE id = p_account_id;
        
        IF v_currency IS NULL THEN
          RAISE EXCEPTION 'Account not found: %', p_account_id;
        END IF;
        
        -- Get transaction count and last transaction for the day
        SELECT 
          COUNT(*),
          MAX(t.id)
        INTO 
          v_transaction_count,
          v_last_transaction_id
        FROM transactions t
        WHERE (t.account_id = p_account_id OR t.counterparty_account_id = p_account_id)
          AND DATE(t.created_at) = p_reconciliation_date
          AND t.status = 'COMPLETED';
        
        -- For now, use internal balance as external balance
        -- In production, this would fetch from BlnkFinance API
        v_external_balance := v_internal_balance;
        
        -- Insert reconciliation log
        INSERT INTO reconciliation_logs (
          account_id,
          reconciliation_date,
          reconciliation_type,
          external_source,
          internal_balance,
          external_balance,
          currency,
          blnk_account_id,
          blnk_balance,
          blnk_sync_status,
          transaction_count_internal,
          last_transaction_id,
          reconciliation_window_start,
          reconciliation_window_end
        ) VALUES (
          p_account_id,
          p_reconciliation_date,
          'DAILY',
          'BLNK_FINANCE',
          v_internal_balance,
          v_external_balance,
          v_currency,
          v_blnk_account_id,
          v_external_balance,
          'SYNCED',
          v_transaction_count,
          v_last_transaction_id,
          p_reconciliation_date::timestamp,
          (p_reconciliation_date + INTERVAL '1 day')::timestamp
        ) RETURNING id INTO v_reconciliation_id;
        
        RETURN v_reconciliation_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
        --Create;
        function to() { }
        reconcile;
        all;
        accounts;
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION reconcile_all_accounts(
        p_reconciliation_date DATE DEFAULT CURRENT_DATE
      )
      RETURNS INTEGER AS $$
      DECLARE
        v_account_record RECORD;
        v_reconciliation_count INTEGER := 0;
      BEGIN
        FOR v_account_record IN 
          SELECT id FROM ledger_accounts 
          WHERE is_active = true 
            AND deleted_at IS NULL
            AND blnk_account_id IS NOT NULL
        LOOP
          PERFORM perform_daily_reconciliation(v_account_record.id, p_reconciliation_date);
          v_reconciliation_count := v_reconciliation_count + 1;
        END LOOP;
        
        RETURN v_reconciliation_count;
      END;
      $$ LANGUAGE plpgsql;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TRIGGER IF EXISTS calculate_reconciliation_variance_trigger ON reconciliation_logs`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_reconciliation_logs_updated_at ON reconciliation_logs`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS reconcile_all_accounts`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS perform_daily_reconciliation`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS calculate_reconciliation_variance`);
        await queryRunner.dropTable("reconciliation_logs");
    }
}
exports.CreateReconciliationLogsTable1755218300004 = CreateReconciliationLogsTable1755218300004;
//# sourceMappingURL=1755218300004-create_reconciliation_logs_table.js.map