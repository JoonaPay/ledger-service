import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from "typeorm";

export class CreateTransactionsTable1755218300001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "transactions",
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
            name: "transaction_reference",
            type: "varchar",
            length: "100",
            isUnique: true,
          },
          {
            name: "transaction_type",
            type: "enum",
            enum: ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "FEE", "INTEREST", "ADJUSTMENT"],
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
            length: "3", // ISO 4217
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "counterparty_account_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "counterparty_name",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "counterparty_identifier",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "blnk_transaction_id",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "external_reference",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "source",
            type: "enum",
            enum: ["INTERNAL", "BANK_TRANSFER", "CARD", "CRYPTO", "WIRE", "ACH", "API"],
            default: "'INTERNAL'",
          },
          {
            name: "status",
            type: "enum",
            enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED", "REVERSED"],
            default: "'PENDING'",
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
            name: "fee_amount",
            type: "decimal",
            precision: 19,
            scale: 4,
            default: "0.0000",
          },
          {
            name: "exchange_rate",
            type: "decimal",
            precision: 12,
            scale: 6,
            isNullable: true,
          },
          {
            name: "original_amount",
            type: "decimal",
            precision: 19,
            scale: 4,
            isNullable: true,
          },
          {
            name: "original_currency",
            type: "varchar",
            length: "3",
            isNullable: true,
          },
          {
            name: "settlement_date",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "value_date",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "authorization_code",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "risk_score",
            type: "decimal",
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: "risk_flags",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "compliance_status",
            type: "enum",
            enum: ["CLEAN", "FLAGGED", "UNDER_REVIEW", "BLOCKED"],
            default: "'CLEAN'",
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "processed_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "failed_reason",
            type: "text",
            isNullable: true,
          },
          {
            name: "reversal_transaction_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "is_reversal",
            type: "boolean",
            default: false,
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
        // Indexes will be created via queryRunner.query() after table creation
        // Foreign keys will be added via ALTER TABLE commands
      }),
      true,
    );

    // Create trigger for updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_transactions_updated_at 
      BEFORE UPDATE ON transactions 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create function to generate transaction references
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION generate_transaction_reference()
      RETURNS TEXT AS $$
      DECLARE
        new_reference TEXT;
        exists_check INTEGER;
      BEGIN
        LOOP
          // Generate transaction reference: TXN + YYYYMMDD + 8 random digits
          new_reference := 'TXN' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
          
          SELECT COUNT(*) INTO exists_check 
          FROM transactions 
          WHERE transaction_reference = new_reference;
          
          IF exists_check = 0 THEN
            EXIT;
          END IF;
        END LOOP;
        
        RETURN new_reference;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger to auto-generate transaction references
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_transaction_reference()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.transaction_reference IS NULL OR NEW.transaction_reference = '' THEN
          NEW.transaction_reference := generate_transaction_reference();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER set_transaction_reference_trigger
      BEFORE INSERT ON transactions
      FOR EACH ROW
      EXECUTE FUNCTION set_transaction_reference();
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_ACCOUNT_ID ON transactions (account_id)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_REFERENCE ON transactions (transaction_reference)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_TYPE ON transactions (transaction_type)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_STATUS ON transactions (status)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_COUNTERPARTY ON transactions (counterparty_account_id)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_BLNK_ID ON transactions (blnk_transaction_id)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_EXTERNAL_REF ON transactions (external_reference)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_SOURCE ON transactions (source)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_COMPLIANCE ON transactions (compliance_status)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_VALUE_DATE ON transactions (value_date)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_PROCESSED_AT ON transactions (processed_at)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_CREATED_AT ON transactions (created_at)`);
    await queryRunner.query(`CREATE INDEX IDX_TRANSACTIONS_REVERSAL ON transactions (is_reversal, reversal_transaction_id)`);

    // Add foreign key constraints
    await queryRunner.query(`ALTER TABLE transactions ADD CONSTRAINT FK_TRANSACTIONS_ACCOUNT_ID FOREIGN KEY (account_id) REFERENCES ledger_accounts(id) ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS set_transaction_reference_trigger ON transactions`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_transaction_reference`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS generate_transaction_reference`);
    await queryRunner.dropTable("transactions");
  }
}