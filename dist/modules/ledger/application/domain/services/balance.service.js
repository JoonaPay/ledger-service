"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const schedule_1 = require("@nestjs/schedule");
const orm_entities_1 = require("../../../infrastructure/orm-entities");
let BalanceService = class BalanceService {
    constructor(accountRepository, entryRepository, snapshotRepository, dataSource) {
        this.accountRepository = accountRepository;
        this.entryRepository = entryRepository;
        this.snapshotRepository = snapshotRepository;
        this.dataSource = dataSource;
    }
    async getAccountBalance(accountId) {
        const account = await this.accountRepository.findOne({
            where: { id: accountId, isActive: true },
        });
        if (!account) {
            throw new Error(`Account ${accountId} not found or inactive`);
        }
        const balanceData = await this.calculateRealTimeBalance(accountId);
        return {
            accountId,
            currentBalance: balanceData.currentBalance,
            availableBalance: balanceData.availableBalance,
            pendingBalance: balanceData.pendingBalance,
            totalDebits: balanceData.totalDebits,
            totalCredits: balanceData.totalCredits,
            currency: account.currency,
            lastUpdated: new Date(),
        };
    }
    async getMultipleAccountBalances(accountIds) {
        return Promise.all(accountIds.map(accountId => this.getAccountBalance(accountId)));
    }
    async getBalanceHistory(accountId, startDate, endDate) {
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
        });
        if (!account) {
            throw new Error(`Account ${accountId} not found`);
        }
        const snapshots = await this.snapshotRepository.find({
            where: {
                accountId,
                snapshotDate: (0, typeorm_2.Between)(startDate, endDate),
                snapshotType: orm_entities_1.SnapshotType.DAILY,
            },
            order: { snapshotDate: 'ASC' },
        });
        const movements = snapshots.map(snapshot => ({
            date: snapshot.snapshotDate,
            openingBalance: snapshot.openingBalance,
            closingBalance: snapshot.closingBalance,
            totalDebits: snapshot.totalDebits,
            totalCredits: snapshot.totalCredits,
            netMovement: snapshot.closingBalance - snapshot.openingBalance,
            transactionCount: snapshot.transactionCount,
        }));
        const firstSnapshot = snapshots[0];
        const lastSnapshot = snapshots[snapshots.length - 1];
        const summary = {
            openingBalance: firstSnapshot?.openingBalance || 0,
            closingBalance: lastSnapshot?.closingBalance || 0,
            totalDebits: snapshots.reduce((sum, s) => sum + s.totalDebits, 0),
            totalCredits: snapshots.reduce((sum, s) => sum + s.totalCredits, 0),
            netMovement: (lastSnapshot?.closingBalance || 0) - (firstSnapshot?.openingBalance || 0),
            transactionCount: snapshots.reduce((sum, s) => sum + s.transactionCount, 0),
        };
        return {
            accountId,
            currency: account.currency,
            period: { start: startDate, end: endDate },
            movements,
            summary,
        };
    }
    async createBalanceSnapshot(accountId, snapshotDate = new Date(), snapshotType = orm_entities_1.SnapshotType.DAILY) {
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
        });
        if (!account) {
            throw new Error(`Account ${accountId} not found`);
        }
        const previousSnapshot = await this.snapshotRepository.findOne({
            where: {
                accountId,
                snapshotDate: (0, typeorm_2.LessThanOrEqual)(new Date(snapshotDate.getTime() - 24 * 60 * 60 * 1000)),
            },
            order: { snapshotDate: 'DESC' },
        });
        const openingBalance = previousSnapshot?.closingBalance || 0;
        const startOfDay = new Date(snapshotDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(snapshotDate);
        endOfDay.setHours(23, 59, 59, 999);
        const dayTransactions = await this.entryRepository
            .createQueryBuilder('entry')
            .innerJoin('entry.transaction', 'transaction')
            .where('entry.accountId = :accountId', { accountId })
            .andWhere('transaction.status = :status', { status: 'COMPLETED' })
            .andWhere('entry.createdAt BETWEEN :start AND :end', {
            start: startOfDay,
            end: endOfDay,
        })
            .getMany();
        const totalDebits = dayTransactions
            .filter(entry => entry.entryType === orm_entities_1.EntryType.DEBIT)
            .reduce((sum, entry) => new decimal_js_1.Decimal(sum).plus(entry.amount).toNumber(), 0);
        const totalCredits = dayTransactions
            .filter(entry => entry.entryType === orm_entities_1.EntryType.CREDIT)
            .reduce((sum, entry) => new decimal_js_1.Decimal(sum).plus(entry.amount).toNumber(), 0);
        const closingBalance = this.calculateClosingBalance(account.accountType, openingBalance, totalDebits, totalCredits);
        const existingSnapshot = await this.snapshotRepository.findOne({
            where: { accountId, snapshotDate, snapshotType },
        });
        if (existingSnapshot) {
            await this.snapshotRepository.update(existingSnapshot.id, {
                openingBalance,
                closingBalance,
                totalDebits,
                totalCredits,
                transactionCount: dayTransactions.length,
                updatedAt: new Date(),
            });
            return existingSnapshot.id;
        }
        else {
            const snapshot = this.snapshotRepository.create({
                accountId,
                snapshotDate,
                snapshotType,
                openingBalance,
                closingBalance,
                totalDebits,
                totalCredits,
                transactionCount: dayTransactions.length,
                currency: account.currency,
            });
            const saved = await this.snapshotRepository.save(snapshot);
            return saved.id;
        }
    }
    async createSnapshotsForAllAccounts(snapshotDate = new Date(), snapshotType = orm_entities_1.SnapshotType.DAILY) {
        const activeAccounts = await this.accountRepository.find({
            where: { isActive: true },
        });
        let snapshotCount = 0;
        for (const account of activeAccounts) {
            try {
                await this.createBalanceSnapshot(account.id, snapshotDate, snapshotType);
                snapshotCount++;
            }
            catch (error) {
                console.error(`Failed to create snapshot for account ${account.id}:`, error);
            }
        }
        return snapshotCount;
    }
    async recalculateAccountBalance(accountId) {
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
        });
        if (!account) {
            throw new Error(`Account ${accountId} not found`);
        }
        const balanceData = await this.calculateRealTimeBalance(accountId);
        await this.accountRepository.update(accountId, {
            balance: balanceData.currentBalance,
            debitBalance: balanceData.totalDebits,
            creditBalance: balanceData.totalCredits,
            updatedAt: new Date(),
        });
    }
    async getBalanceAtDate(accountId, date) {
        const snapshot = await this.snapshotRepository.findOne({
            where: {
                accountId,
                snapshotDate: (0, typeorm_2.LessThanOrEqual)(date),
            },
            order: { snapshotDate: 'DESC' },
        });
        if (snapshot && this.isSameDay(snapshot.snapshotDate, date)) {
            return snapshot.closingBalance;
        }
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
        });
        if (!account) {
            throw new Error(`Account ${accountId} not found`);
        }
        const entries = await this.entryRepository
            .createQueryBuilder('entry')
            .innerJoin('entry.transaction', 'transaction')
            .where('entry.accountId = :accountId', { accountId })
            .andWhere('transaction.status = :status', { status: 'COMPLETED' })
            .andWhere('entry.createdAt <= :date', { date })
            .orderBy('entry.createdAt', 'ASC')
            .getMany();
        const totalDebits = entries
            .filter(entry => entry.entryType === orm_entities_1.EntryType.DEBIT)
            .reduce((sum, entry) => new decimal_js_1.Decimal(sum).plus(entry.amount).toNumber(), 0);
        const totalCredits = entries
            .filter(entry => entry.entryType === orm_entities_1.EntryType.CREDIT)
            .reduce((sum, entry) => new decimal_js_1.Decimal(sum).plus(entry.amount).toNumber(), 0);
        return this.calculateClosingBalance(account.accountType, 0, totalDebits, totalCredits);
    }
    async createDailySnapshots() {
        console.log('Starting daily balance snapshot creation...');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        try {
            const snapshotCount = await this.createSnapshotsForAllAccounts(yesterday, orm_entities_1.SnapshotType.DAILY);
            console.log(`Created ${snapshotCount} daily balance snapshots for ${yesterday.toISOString().split('T')[0]}`);
        }
        catch (error) {
            console.error('Failed to create daily snapshots:', error);
        }
    }
    async calculateRealTimeBalance(accountId) {
        const entries = await this.entryRepository
            .createQueryBuilder('entry')
            .innerJoin('entry.transaction', 'transaction')
            .where('entry.accountId = :accountId', { accountId })
            .andWhere('transaction.status IN (:...statuses)', {
            statuses: ['COMPLETED', 'PENDING', 'PROCESSING']
        })
            .getMany();
        const completedEntries = entries.filter(entry => ['COMPLETED'].includes(entry.transaction?.status));
        const pendingEntries = entries.filter(entry => ['PENDING', 'PROCESSING'].includes(entry.transaction?.status));
        const completedDebits = completedEntries
            .filter(entry => entry.entryType === orm_entities_1.EntryType.DEBIT)
            .reduce((sum, entry) => new decimal_js_1.Decimal(sum).plus(entry.amount).toNumber(), 0);
        const completedCredits = completedEntries
            .filter(entry => entry.entryType === orm_entities_1.EntryType.CREDIT)
            .reduce((sum, entry) => new decimal_js_1.Decimal(sum).plus(entry.amount).toNumber(), 0);
        const pendingDebits = pendingEntries
            .filter(entry => entry.entryType === orm_entities_1.EntryType.DEBIT)
            .reduce((sum, entry) => new decimal_js_1.Decimal(sum).plus(entry.amount).toNumber(), 0);
        const pendingCredits = pendingEntries
            .filter(entry => entry.entryType === orm_entities_1.EntryType.CREDIT)
            .reduce((sum, entry) => new decimal_js_1.Decimal(sum).plus(entry.amount).toNumber(), 0);
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
        });
        const currentBalance = this.calculateClosingBalance(account.accountType, 0, completedDebits, completedCredits);
        const pendingBalance = this.calculateClosingBalance(account.accountType, 0, pendingDebits, pendingCredits);
        return {
            currentBalance,
            availableBalance: currentBalance,
            pendingBalance,
            totalDebits: completedDebits,
            totalCredits: completedCredits,
        };
    }
    calculateClosingBalance(accountType, openingBalance, totalDebits, totalCredits) {
        const opening = new decimal_js_1.Decimal(openingBalance);
        const debits = new decimal_js_1.Decimal(totalDebits);
        const credits = new decimal_js_1.Decimal(totalCredits);
        if (accountType === orm_entities_1.AccountType.ASSET || accountType === orm_entities_1.AccountType.EXPENSE) {
            return opening.plus(debits).minus(credits).toNumber();
        }
        return opening.plus(credits).minus(debits).toNumber();
    }
    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }
};
exports.BalanceService = BalanceService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BalanceService.prototype, "createDailySnapshots", null);
exports.BalanceService = BalanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orm_entities_1.LedgerAccountOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(orm_entities_1.TransactionEntryOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(orm_entities_1.BalanceSnapshotOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], BalanceService);
//# sourceMappingURL=balance.service.js.map