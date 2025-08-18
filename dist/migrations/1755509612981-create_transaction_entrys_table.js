"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionEntryTable1755509612981 = void 0;
const typeorm_1 = require("typeorm");
class CreateTransactionEntryTable1755509612981 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "transaction_entrys",
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
        await queryRunner.dropTable("transaction_entrys");
    }
}
exports.CreateTransactionEntryTable1755509612981 = CreateTransactionEntryTable1755509612981;
//# sourceMappingURL=1755509612981-create_transaction_entrys_table.js.map