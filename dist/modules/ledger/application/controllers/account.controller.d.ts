import { Repository } from 'typeorm';
import { LedgerAccountOrmEntity, AccountType, AccountStatus, TransactionEntryOrmEntity } from '../../infrastructure/orm-entities';
import { BalanceService } from '../domain/services/balance.service';
import { BlnkFinanceService } from '../../infrastructure/external/blnkfinance.service';
import { CreateAccountDto } from '../dto/requests/create-account.dto';
import { UpdateAccountDto } from '../dto/requests/update-account.dto';
import { AccountDto, AccountBalanceDto, AccountStatementDto } from '../dto/responses/account.dto';
export declare class AccountController {
    private readonly accountRepository;
    private readonly entryRepository;
    private readonly balanceService;
    private readonly blnkFinanceService;
    private readonly logger;
    constructor(accountRepository: Repository<LedgerAccountOrmEntity>, entryRepository: Repository<TransactionEntryOrmEntity>, balanceService: BalanceService, blnkFinanceService: BlnkFinanceService);
    createAccount(createAccountDto: CreateAccountDto): Promise<AccountDto>;
    getAccounts(userId?: string, currency?: string, accountType?: AccountType, status?: AccountStatus, limit?: number, offset?: number): Promise<{
        accounts: AccountDto[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getAccount(id: string): Promise<AccountDto>;
    updateAccount(id: string, updateAccountDto: UpdateAccountDto): Promise<AccountDto>;
    deleteAccount(id: string): Promise<void>;
    getAccountBalance(id: string): Promise<AccountBalanceDto>;
    getAccountStatement(id: string, startDate?: string, endDate?: string): Promise<AccountStatementDto>;
    syncAccount(id: string): Promise<{
        status: string;
        internalBalance: number;
        externalBalance: number;
        variance: number;
    }>;
    recalculateBalance(id: string): Promise<AccountBalanceDto>;
    private mapToAccountDto;
}
