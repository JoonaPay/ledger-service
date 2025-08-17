import { plainToInstance, Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, validateSync, IsUrl, IsBoolean } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number = 3001;

  @IsString()
  @IsOptional()
  APP_NAME: string = 'JoonaPay Ledger Service';

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  KAFKA_BROKERS: string = 'localhost:9092';

  @IsString()
  @IsOptional()
  KAFKA_CLIENT_ID: string = 'ledger-service';

  @IsString()
  @IsOptional()
  KAFKA_GROUP_ID: string = 'ledger-service-group';

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  KAFKA_SSL: boolean = false;

  @IsString()
  @IsOptional()
  KAFKA_SASL_MECHANISM?: string;

  @IsString()
  @IsOptional()
  KAFKA_SASL_USERNAME?: string;

  @IsString()
  @IsOptional()
  KAFKA_SASL_PASSWORD?: string;

  @IsUrl()
  @IsOptional()
  BLNKFINANCE_URL: string = 'https://api.blnkfinance.com';

  @IsString()
  @IsNotEmpty()
  BLNKFINANCE_API_KEY: string;

  @IsString()
  @IsOptional()
  BLNKFINANCE_ORGANIZATION?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  BLNKFINANCE_TIMEOUT: number = 30000;

  @IsString()
  @IsOptional()
  REDIS_URL: string = 'redis://localhost:6379';

  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  REDIS_DB: number = 0;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  THROTTLE_TTL: number = 60;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  THROTTLE_LIMIT: number = 100;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== 'false')
  METRICS_ENABLED: boolean = true;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const mergedConfig = Object.assign(new EnvironmentVariables(), validatedConfig);
  
  const isProduction = mergedConfig.NODE_ENV === Environment.Production;
  
  const errors = validateSync(mergedConfig, {
    skipMissingProperties: !isProduction,
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map(error => 
      Object.values(error.constraints || {}).join(', ')
    ).join('; ');
    
    throw new Error(`Configuration validation failed: ${errorMessages}`);
  }

  return mergedConfig;
}