import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export interface ExchangeRate {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    timestamp: Date;
    source: string;
}
export interface CurrencyConversion {
    fromCurrency: string;
    toCurrency: string;
    fromAmount: number;
    toAmount: number;
    exchangeRate: number;
    fee?: number;
    netAmount?: number;
    timestamp: Date;
}
export interface SupportedCurrency {
    code: string;
    name: string;
    symbol: string;
    decimals: number;
    isActive: boolean;
    isBaseCurrency: boolean;
}
export declare class CurrencyService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private readonly exchangeRateCache;
    private readonly baseCurrency;
    private readonly exchangeRateProvider;
    private readonly apiKey;
    private readonly supportedCurrencies;
    constructor(configService: ConfigService, httpService: HttpService);
    getSupportedCurrencies(): SupportedCurrency[];
    isCurrencySupported(currencyCode: string): boolean;
    getCurrencyInfo(currencyCode: string): SupportedCurrency | null;
    getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate>;
    convertCurrency(amount: number, fromCurrency: string, toCurrency: string, includeConversionFee?: boolean): Promise<CurrencyConversion>;
    convertMultipleCurrencies(amounts: Array<{
        amount: number;
        currency: string;
    }>, targetCurrency: string): Promise<Array<CurrencyConversion & {
        originalAmount: number;
        originalCurrency: string;
    }>>;
    getTotalValueInCurrency(amounts: Array<{
        amount: number;
        currency: string;
    }>, targetCurrency: string): Promise<{
        totalAmount: number;
        currency: string;
        conversions: CurrencyConversion[];
    }>;
    formatCurrency(amount: number, currencyCode: string): string;
    validateCurrencyAmount(amount: number, currencyCode: string): {
        isValid: boolean;
        errors: string[];
    };
    updateExchangeRates(): Promise<void>;
    private fetchExchangeRate;
    private fetchFromExchangeRateAPI;
    private fetchFromFixer;
    private fetchFromCurrencyLayer;
    private isRateStillValid;
    private getConversionFeeRate;
    private getMinimumAmount;
    private getMaximumAmount;
    private roundToDecimals;
    private getDecimalPlaces;
}
