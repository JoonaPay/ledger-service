"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionTable1755509594927 = void 0;
const typeorm_1 = require("typeorm");
class CreateTransactionTable1755509594927 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable("transactions");
    }
}
exports.CreateTransactionTable1755509594927 = CreateTransactionTable1755509594927;
//# sourceMappingURL=1755509594927-create_transactions_table.js.map