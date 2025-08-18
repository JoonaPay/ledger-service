"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccountTable1755509603739 = void 0;
const typeorm_1 = require("typeorm");
class CreateAccountTable1755509603739 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "accounts",
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
        await queryRunner.dropTable("accounts");
    }
}
exports.CreateAccountTable1755509603739 = CreateAccountTable1755509603739;
//# sourceMappingURL=1755509603739-create_accounts_table.js.map