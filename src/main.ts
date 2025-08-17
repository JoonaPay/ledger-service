import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const port = configService.get<number>('port', 3001);
    const appName = configService.get<string>('appName', 'JoonaPay Ledger Service');
    const nodeEnv = configService.get<string>('nodeEnv', 'development');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.enableCors({
      origin: true,
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('JoonaPay Ledger Service API')
      .setDescription(
        'Financial transaction processing and ledger management service for JoonaPay platform. ' +
        'Handles double-entry bookkeeping, multi-currency transactions, and integration with BlnkFinance.'
      )
      .setVersion('1.0.0')
      .setContact('JoonaPay Development Team', 'https://joonapay.com', 'dev@joonapay.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addTag('Accounts', 'Ledger account creation and management')
      .addTag('Transactions', 'Transaction processing and history')
      .addTag('Balances', 'Account balance queries and statements')
      .addTag('BlnkFinance', 'External ledger provider integration')
      .addTag('Health', 'Service health and monitoring endpoints')
      .addTag('Metrics', 'Prometheus metrics and performance monitoring')
      .addServer('http://localhost:3002', 'Development server')
      .addServer('https://ledger.joonapay.com', 'Production server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    await app.listen(port);
    
    logger.log(`🚀 ${appName} is running on port ${port}`);
    logger.log(`📚 API Documentation available at http://localhost:${port}/api`);
    logger.log(`📊 Metrics available at http://localhost:${port}/metrics`);
    logger.log(`❤️ Health check available at http://localhost:${port}/health`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
    
  } catch (error) {
    logger.error('❌ Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
