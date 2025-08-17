import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from 'decimal.js';

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

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private readonly exchangeRateCache = new Map<string, ExchangeRate>();
  private readonly baseCurrency: string;
  private readonly exchangeRateProvider: string;
  private readonly apiKey: string;

  // Supported currencies configuration
  private readonly supportedCurrencies: SupportedCurrency[] = [
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

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseCurrency = this.configService.get<string>('currency.baseCurrency', 'USD');
    this.exchangeRateProvider = this.configService.get<string>('currency.provider', 'exchangerate-api');
    this.apiKey = this.configService.get<string>('currency.apiKey', '');
  }

  /**
   * Gets list of supported currencies
   */
  getSupportedCurrencies(): SupportedCurrency[] {
    return this.supportedCurrencies.filter(currency => currency.isActive);
  }

  /**
   * Checks if a currency is supported
   */
  isCurrencySupported(currencyCode: string): boolean {
    return this.supportedCurrencies.some(
      currency => currency.code === currencyCode && currency.isActive
    );
  }

  /**
   * Gets currency information
   */
  getCurrencyInfo(currencyCode: string): SupportedCurrency | null {
    return this.supportedCurrencies.find(
      currency => currency.code === currencyCode && currency.isActive
    ) || null;
  }

  /**
   * Gets current exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate> {
    // Check if same currency
    if (fromCurrency === toCurrency) {
      return {
        fromCurrency,
        toCurrency,
        rate: 1,
        timestamp: new Date(),
        source: 'IDENTITY',
      };
    }

    // Check cache first
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cachedRate = this.exchangeRateCache.get(cacheKey);
    
    if (cachedRate && this.isRateStillValid(cachedRate)) {
      return cachedRate;
    }

    // Fetch fresh rate
    const rate = await this.fetchExchangeRate(fromCurrency, toCurrency);
    
    // Cache the rate
    this.exchangeRateCache.set(cacheKey, rate);
    
    return rate;
  }

  /**
   * Converts amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    includeConversionFee = true
  ): Promise<CurrencyConversion> {
    if (!this.isCurrencySupported(fromCurrency)) {
      throw new Error(`Unsupported source currency: ${fromCurrency}`);
    }

    if (!this.isCurrencySupported(toCurrency)) {
      throw new Error(`Unsupported target currency: ${toCurrency}`);
    }

    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
    const fromAmount = new Decimal(amount);
    const rate = new Decimal(exchangeRate.rate);
    
    // Calculate converted amount
    const toAmount = fromAmount.mul(rate);
    
    // Calculate conversion fee if applicable
    let fee = 0;
    let netAmount = toAmount.toNumber();
    
    if (includeConversionFee && fromCurrency !== toCurrency) {
      const feeRate = this.getConversionFeeRate(fromCurrency, toCurrency);
      fee = toAmount.mul(feeRate).toNumber();
      netAmount = toAmount.minus(fee).toNumber();
    }

    // Round to appropriate decimal places
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

  /**
   * Converts multiple amounts to a target currency
   */
  async convertMultipleCurrencies(
    amounts: Array<{ amount: number; currency: string }>,
    targetCurrency: string
  ): Promise<Array<CurrencyConversion & { originalAmount: number; originalCurrency: string }>> {
    const conversions = await Promise.all(
      amounts.map(async ({ amount, currency }) => {
        const conversion = await this.convertCurrency(amount, currency, targetCurrency);
        return {
          ...conversion,
          originalAmount: amount,
          originalCurrency: currency,
        };
      })
    );

    return conversions;
  }

  /**
   * Gets total value in target currency for multiple amounts
   */
  async getTotalValueInCurrency(
    amounts: Array<{ amount: number; currency: string }>,
    targetCurrency: string
  ): Promise<{ totalAmount: number; currency: string; conversions: CurrencyConversion[] }> {
    const conversions = await Promise.all(
      amounts.map(({ amount, currency }) => 
        this.convertCurrency(amount, currency, targetCurrency)
      )
    );

    const totalAmount = conversions.reduce(
      (sum, conversion) => sum + (conversion.netAmount || conversion.toAmount),
      0
    );

    const targetCurrencyInfo = this.getCurrencyInfo(targetCurrency);
    const decimals = targetCurrencyInfo?.decimals || 2;

    return {
      totalAmount: this.roundToDecimals(totalAmount, decimals),
      currency: targetCurrency,
      conversions,
    };
  }

  /**
   * Formats currency amount for display
   */
  formatCurrency(amount: number, currencyCode: string): string {
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

  /**
   * Validates currency amount based on currency rules
   */
  validateCurrencyAmount(amount: number, currencyCode: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const currencyInfo = this.getCurrencyInfo(currencyCode);

    if (!currencyInfo) {
      errors.push(`Unsupported currency: ${currencyCode}`);
      return { isValid: false, errors };
    }

    if (amount <= 0) {
      errors.push('Amount must be positive');
    }

    // Check decimal precision
    const expectedDecimals = currencyInfo.decimals;
    const actualDecimals = this.getDecimalPlaces(amount);
    
    if (actualDecimals > expectedDecimals) {
      errors.push(`Amount has too many decimal places. ${currencyCode} supports ${expectedDecimals} decimal places`);
    }

    // Check minimum amounts
    const minAmount = this.getMinimumAmount(currencyCode);
    if (amount < minAmount) {
      errors.push(`Amount below minimum of ${minAmount} ${currencyCode}`);
    }

    // Check maximum amounts
    const maxAmount = this.getMaximumAmount(currencyCode);
    if (amount > maxAmount) {
      errors.push(`Amount exceeds maximum of ${maxAmount} ${currencyCode}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Automated exchange rate updates (runs every 15 minutes)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateExchangeRates(): Promise<void> {
    this.logger.log('Updating exchange rates...');
    
    try {
      const activeCurrencies = this.getSupportedCurrencies();
      const baseCurrency = this.baseCurrency;
      
      // Update rates for all supported currencies against base currency
      for (const currency of activeCurrencies) {
        if (currency.code !== baseCurrency) {
          try {
            await this.getExchangeRate(baseCurrency, currency.code);
            await this.getExchangeRate(currency.code, baseCurrency);
          } catch (error) {
            this.logger.error(`Failed to update rate for ${currency.code}: ${error.message}`);
          }
        }
      }
      
      this.logger.log(`Updated exchange rates for ${activeCurrencies.length} currencies`);
    } catch (error) {
      this.logger.error('Failed to update exchange rates:', error);
    }
  }

  // Private helper methods
  private async fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate> {
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
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rate ${fromCurrency}/${toCurrency}: ${error.message}`);
      
      // Fallback to cached rate or throw error
      const cacheKey = `${fromCurrency}_${toCurrency}`;
      const cachedRate = this.exchangeRateCache.get(cacheKey);
      
      if (cachedRate) {
        this.logger.warn(`Using cached exchange rate for ${fromCurrency}/${toCurrency}`);
        return cachedRate;
      }
      
      throw error;
    }
  }

  private async fetchFromExchangeRateAPI(fromCurrency: string, toCurrency: string): Promise<ExchangeRate> {
    const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
    
    const response = await firstValueFrom(
      this.httpService.get(url, {
        timeout: 10000,
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {},
      })
    );

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

  private async fetchFromFixer(fromCurrency: string, toCurrency: string): Promise<ExchangeRate> {
    const url = `https://api.fixer.io/latest?access_key=${this.apiKey}&base=${fromCurrency}&symbols=${toCurrency}`;
    
    const response = await firstValueFrom(
      this.httpService.get(url, { timeout: 10000 })
    );

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

  private async fetchFromCurrencyLayer(fromCurrency: string, toCurrency: string): Promise<ExchangeRate> {
    const url = `https://api.currencylayer.com/live?access_key=${this.apiKey}&source=${fromCurrency}&currencies=${toCurrency}`;
    
    const response = await firstValueFrom(
      this.httpService.get(url, { timeout: 10000 })
    );

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

  private isRateStillValid(rate: ExchangeRate): boolean {
    const maxAge = this.configService.get<number>('currency.cacheMaxAge', 300000); // 5 minutes
    const age = Date.now() - rate.timestamp.getTime();
    return age < maxAge;
  }

  private getConversionFeeRate(fromCurrency: string, toCurrency: string): number {
    // Default conversion fee rate (0.5%)
    const defaultFeeRate = this.configService.get<number>('currency.defaultFeeRate', 0.005);
    
    // Special rates for specific currency pairs can be configured
    const feeRates = this.configService.get<Record<string, number>>('currency.feeRates', {});
    const pairKey = `${fromCurrency}_${toCurrency}`;
    
    return feeRates[pairKey] || defaultFeeRate;
  }

  private getMinimumAmount(currencyCode: string): number {
    const minimums: Record<string, number> = {
      'USD': 0.01,
      'EUR': 0.01,
      'GBP': 0.01,
      'JPY': 1,
      'BTC': 0.00000001,
      'ETH': 0.000000000000000001,
    };
    
    return minimums[currencyCode] || 0.01;
  }

  private getMaximumAmount(currencyCode: string): number {
    const maximums: Record<string, number> = {
      'USD': 1000000,
      'EUR': 1000000,
      'GBP': 1000000,
      'JPY': 100000000,
      'BTC': 21000000,
      'ETH': 1000000000,
    };
    
    return maximums[currencyCode] || 1000000;
  }

  private roundToDecimals(value: number, decimals: number): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  private getDecimalPlaces(value: number): number {
    if (Math.floor(value) === value) return 0;
    return value.toString().split('.')[1]?.length || 0;
  }
}