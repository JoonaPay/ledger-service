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
var CurrencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const schedule_1 = require("@nestjs/schedule");
const decimal_js_1 = require("decimal.js");
let CurrencyService = CurrencyService_1 = class CurrencyService {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(CurrencyService_1.name);
        this.exchangeRateCache = new Map();
        this.supportedCurrencies = [
            { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, isActive: true, isBaseCurrency: true },
            { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, isActive: true, isBaseCurrency: false },
            { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, isActive: true, isBaseCurrency: false },
            { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, isActive: true, isBaseCurrency: false },
            { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2, isActive: true, isBaseCurrency: false },
            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, isActive: true, isBaseCurrency: false },
            { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, isActive: true, isBaseCurrency: false },
            { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, isActive: true, isBaseCurrency: false },
            { code: 'BTC', name: 'Bitcoin', symbol: '₿', decimals: 8, isActive: true, isBaseCurrency: false },
            { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', decimals: 18, isActive: true, isBaseCurrency: false },
        ];
        this.baseCurrency = this.configService.get('currency.baseCurrency', 'USD');
        this.exchangeRateProvider = this.configService.get('currency.provider', 'exchangerate-api');
        this.apiKey = this.configService.get('currency.apiKey', '');
    }
    getSupportedCurrencies() {
        return this.supportedCurrencies.filter(currency => currency.isActive);
    }
    isCurrencySupported(currencyCode) {
        return this.supportedCurrencies.some(currency => currency.code === currencyCode && currency.isActive);
    }
    getCurrencyInfo(currencyCode) {
        return this.supportedCurrencies.find(currency => currency.code === currencyCode && currency.isActive) || null;
    }
    async getExchangeRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return {
                fromCurrency,
                toCurrency,
                rate: 1,
                timestamp: new Date(),
                source: 'IDENTITY',
            };
        }
        const cacheKey = `${fromCurrency}_${toCurrency}`;
        const cachedRate = this.exchangeRateCache.get(cacheKey);
        if (cachedRate && this.isRateStillValid(cachedRate)) {
            return cachedRate;
        }
        const rate = await this.fetchExchangeRate(fromCurrency, toCurrency);
        this.exchangeRateCache.set(cacheKey, rate);
        return rate;
    }
    async convertCurrency(amount, fromCurrency, toCurrency, includeConversionFee = true) {
        if (!this.isCurrencySupported(fromCurrency)) {
            throw new Error(`Unsupported source currency: ${fromCurrency}`);
        }
        if (!this.isCurrencySupported(toCurrency)) {
            throw new Error(`Unsupported target currency: ${toCurrency}`);
        }
        const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
        const fromAmount = new decimal_js_1.Decimal(amount);
        const rate = new decimal_js_1.Decimal(exchangeRate.rate);
        const toAmount = fromAmount.mul(rate);
        let fee = 0;
        let netAmount = toAmount.toNumber();
        if (includeConversionFee && fromCurrency !== toCurrency) {
            const feeRate = this.getConversionFeeRate(fromCurrency, toCurrency);
            fee = toAmount.mul(feeRate).toNumber();
            netAmount = toAmount.minus(fee).toNumber();
        }
        const toCurrencyInfo = this.getCurrencyInfo(toCurrency);
        const decimals = toCurrencyInfo?.decimals || 2;
        return {
            fromCurrency,
            toCurrency,
            fromAmount: amount,
            toAmount: this.roundToDecimals(toAmount.toNumber(), decimals),
            exchangeRate: exchangeRate.rate,
            fee: includeConversionFee ? this.roundToDecimals(fee, decimals) : undefined,
            netAmount: includeConversionFee ? this.roundToDecimals(netAmount, decimals) : undefined,
            timestamp: new Date(),
        };
    }
    async convertMultipleCurrencies(amounts, targetCurrency) {
        const conversions = await Promise.all(amounts.map(async ({ amount, currency }) => {
            const conversion = await this.convertCurrency(amount, currency, targetCurrency);
            return {
                ...conversion,
                originalAmount: amount,
                originalCurrency: currency,
            };
        }));
        return conversions;
    }
    async getTotalValueInCurrency(amounts, targetCurrency) {
        const conversions = await Promise.all(amounts.map(({ amount, currency }) => this.convertCurrency(amount, currency, targetCurrency)));
        const totalAmount = conversions.reduce((sum, conversion) => sum + (conversion.netAmount || conversion.toAmount), 0);
        const targetCurrencyInfo = this.getCurrencyInfo(targetCurrency);
        const decimals = targetCurrencyInfo?.decimals || 2;
        return {
            totalAmount: this.roundToDecimals(totalAmount, decimals),
            currency: targetCurrency,
            conversions,
        };
    }
    formatCurrency(amount, currencyCode) {
        const currencyInfo = this.getCurrencyInfo(currencyCode);
        if (!currencyInfo) {
            return `${amount} ${currencyCode}`;
        }
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: currencyInfo.decimals,
            maximumFractionDigits: currencyInfo.decimals,
        });
        return formatter.format(amount);
    }
    validateCurrencyAmount(amount, currencyCode) {
        const errors = [];
        const currencyInfo = this.getCurrencyInfo(currencyCode);
        if (!currencyInfo) {
            errors.push(`Unsupported currency: ${currencyCode}`);
            return { isValid: false, errors };
        }
        if (amount <= 0) {
            errors.push('Amount must be positive');
        }
        const expectedDecimals = currencyInfo.decimals;
        const actualDecimals = this.getDecimalPlaces(amount);
        if (actualDecimals > expectedDecimals) {
            errors.push(`Amount has too many decimal places. ${currencyCode} supports ${expectedDecimals} decimal places`);
        }
        const minAmount = this.getMinimumAmount(currencyCode);
        if (amount < minAmount) {
            errors.push(`Amount below minimum of ${minAmount} ${currencyCode}`);
        }
        const maxAmount = this.getMaximumAmount(currencyCode);
        if (amount > maxAmount) {
            errors.push(`Amount exceeds maximum of ${maxAmount} ${currencyCode}`);
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    async updateExchangeRates() {
        this.logger.log('Updating exchange rates...');
        try {
            const activeCurrencies = this.getSupportedCurrencies();
            const baseCurrency = this.baseCurrency;
            for (const currency of activeCurrencies) {
                if (currency.code !== baseCurrency) {
                    try {
                        await this.getExchangeRate(baseCurrency, currency.code);
                        await this.getExchangeRate(currency.code, baseCurrency);
                    }
                    catch (error) {
                        this.logger.error(`Failed to update rate for ${currency.code}: ${error.message}`);
                    }
                }
            }
            this.logger.log(`Updated exchange rates for ${activeCurrencies.length} currencies`);
        }
        catch (error) {
            this.logger.error('Failed to update exchange rates:', error);
        }
    }
    async fetchExchangeRate(fromCurrency, toCurrency) {
        try {
            switch (this.exchangeRateProvider) {
                case 'exchangerate-api':
                    return await this.fetchFromExchangeRateAPI(fromCurrency, toCurrency);
                case 'fixer':
                    return await this.fetchFromFixer(fromCurrency, toCurrency);
                case 'currencylayer':
                    return await this.fetchFromCurrencyLayer(fromCurrency, toCurrency);
                default:
                    return await this.fetchFromExchangeRateAPI(fromCurrency, toCurrency);
            }
        }
        catch (error) {
            this.logger.error(`Failed to fetch exchange rate ${fromCurrency}/${toCurrency}: ${error.message}`);
            const cacheKey = `${fromCurrency}_${toCurrency}`;
            const cachedRate = this.exchangeRateCache.get(cacheKey);
            if (cachedRate) {
                this.logger.warn(`Using cached exchange rate for ${fromCurrency}/${toCurrency}`);
                return cachedRate;
            }
            throw error;
        }
    }
    async fetchFromExchangeRateAPI(fromCurrency, toCurrency) {
        const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
            timeout: 10000,
            headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {},
        }));
        const rate = response.data.rates[toCurrency];
        if (!rate) {
            throw new Error(`Exchange rate not found for ${fromCurrency}/${toCurrency}`);
        }
        return {
            fromCurrency,
            toCurrency,
            rate,
            timestamp: new Date(),
            source: 'EXCHANGERATE_API',
        };
    }
    async fetchFromFixer(fromCurrency, toCurrency) {
        const url = `https://api.fixer.io/latest?access_key=${this.apiKey}&base=${fromCurrency}&symbols=${toCurrency}`;
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { timeout: 10000 }));
        if (!response.data.success) {
            throw new Error(`Fixer API error: ${response.data.error?.info || 'Unknown error'}`);
        }
        const rate = response.data.rates[toCurrency];
        if (!rate) {
            throw new Error(`Exchange rate not found for ${fromCurrency}/${toCurrency}`);
        }
        return {
            fromCurrency,
            toCurrency,
            rate,
            timestamp: new Date(),
            source: 'FIXER',
        };
    }
    async fetchFromCurrencyLayer(fromCurrency, toCurrency) {
        const url = `https://api.currencylayer.com/live?access_key=${this.apiKey}&source=${fromCurrency}&currencies=${toCurrency}`;
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { timeout: 10000 }));
        if (!response.data.success) {
            throw new Error(`CurrencyLayer API error: ${response.data.error?.info || 'Unknown error'}`);
        }
        const rateKey = `${fromCurrency}${toCurrency}`;
        const rate = response.data.quotes[rateKey];
        if (!rate) {
            throw new Error(`Exchange rate not found for ${fromCurrency}/${toCurrency}`);
        }
        return {
            fromCurrency,
            toCurrency,
            rate,
            timestamp: new Date(),
            source: 'CURRENCYLAYER',
        };
    }
    isRateStillValid(rate) {
        const maxAge = this.configService.get('currency.cacheMaxAge', 300000);
        const age = Date.now() - rate.timestamp.getTime();
        return age < maxAge;
    }
    getConversionFeeRate(fromCurrency, toCurrency) {
        const defaultFeeRate = this.configService.get('currency.defaultFeeRate', 0.005);
        const feeRates = this.configService.get('currency.feeRates', {});
        const pairKey = `${fromCurrency}_${toCurrency}`;
        return feeRates[pairKey] || defaultFeeRate;
    }
    getMinimumAmount(currencyCode) {
        const minimums = {
            'USD': 0.01,
            'EUR': 0.01,
            'GBP': 0.01,
            'JPY': 1,
            'BTC': 0.00000001,
            'ETH': 0.000000000000000001,
        };
        return minimums[currencyCode] || 0.01;
    }
    getMaximumAmount(currencyCode) {
        const maximums = {
            'USD': 1000000,
            'EUR': 1000000,
            'GBP': 1000000,
            'JPY': 100000000,
            'BTC': 21000000,
            'ETH': 1000000000,
        };
        return maximums[currencyCode] || 1000000;
    }
    roundToDecimals(value, decimals) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    getDecimalPlaces(value) {
        if (Math.floor(value) === value)
            return 0;
        return value.toString().split('.')[1]?.length || 0;
    }
};
exports.CurrencyService = CurrencyService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CurrencyService.prototype, "updateExchangeRates", null);
exports.CurrencyService = CurrencyService = CurrencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map