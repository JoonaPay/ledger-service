import {
  Controller,
  Post,
  Body,
  Headers,
  HttpStatus,
  HttpCode,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { BlnkFinanceService, BlnkWebhookEvent } from '../../infrastructure/external/blnkfinance.service';
import { IsString, IsObject, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as crypto from 'crypto';

class BlnkWebhookDto {
  @ApiProperty({
    description: 'Event type',
    example: 'transaction.completed',
  })
  @IsString()
  @IsNotEmpty()
  event_type: string;

  @ApiProperty({
    description: 'Event ID',
    example: 'evt_123456789',
  })
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @ApiProperty({
    description: 'Event timestamp',
    example: '2024-01-01T10:00:00Z',
  })
  @IsDateString()
  timestamp: string;

  @ApiProperty({
    description: 'Event data',
    example: {
      account: {
        account_id: 'blnk_acc_123',
        balance: 1000.00,
        currency: 'USD'
      }
    },
  })
  @IsObject()
  data: any;
}

@ApiTags('Webhooks')
@Controller('api/v1/webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly blnkFinanceService: BlnkFinanceService,
    private readonly configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.get<string>('blnkfinance.webhookSecret', '');
  }

  @Post('blnk')
  @ApiOperation({
    summary: 'BlnkFinance webhook handler',
    description: 'Handles webhook events from BlnkFinance external service',
  })
  @ApiHeader({
    name: 'X-Blnk-Signature',
    description: 'Webhook signature for verification',
    required: true,
  })
  @ApiBody({ type: BlnkWebhookDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        received: { type: 'boolean' },
        eventId: { type: 'string' },
        eventType: { type: 'string' },
        processedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid webhook payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid webhook signature',
  })
  @HttpCode(HttpStatus.OK)
  async handleBlnkWebhook(
    @Body() webhookData: BlnkWebhookDto,
    @Headers('x-blnk-signature') signature?: string,
    @Headers('content-type') contentType?: string
  ): Promise<{
    received: boolean;
    eventId: string;
    eventType: string;
    processedAt: string;
  }> {
    this.logger.log(`Received BlnkFinance webhook: ${webhookData.event_type} - ${webhookData.event_id}`);

    try {
      // Verify webhook signature if secret is configured
      if (this.webhookSecret && signature) {
        const isValid = this.verifyWebhookSignature(
          JSON.stringify(webhookData),
          signature,
          this.webhookSecret
        );
        
        if (!isValid) {
          this.logger.warn(`Invalid webhook signature for event: ${webhookData.event_id}`);
          throw new UnauthorizedException('Invalid webhook signature');
        }
      }

      // Convert DTO to BlnkWebhookEvent
      const event: BlnkWebhookEvent = {
        event_type: webhookData.event_type as any,
        event_id: webhookData.event_id,
        timestamp: webhookData.timestamp,
        data: webhookData.data,
      };

      // Process the webhook event
      await this.blnkFinanceService.handleWebhookEvent(event);

      this.logger.log(`BlnkFinance webhook processed successfully: ${webhookData.event_id}`);

      return {
        received: true,
        eventId: webhookData.event_id,
        eventType: webhookData.event_type,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to process BlnkFinance webhook: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new BadRequestException(`Webhook processing failed: ${error.message}`);
    }
  }

  @Post('test')
  @ApiOperation({
    summary: 'Test webhook endpoint',
    description: 'Test endpoint for webhook development and debugging',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test webhook received',
    schema: {
      type: 'object',
      properties: {
        received: { type: 'boolean' },
        echo: { type: 'object' },
        timestamp: { type: 'string' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async testWebhook(
    @Body() testData: any,
    @Headers() headers: Record<string, string>
  ): Promise<{
    received: boolean;
    echo: any;
    headers: Record<string, string>;
    timestamp: string;
  }> {
    this.logger.log('Test webhook received');
    
    return {
      received: true,
      echo: testData,
      headers,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verifies webhook signature using HMAC-SHA256
   */
  private verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      // Remove 'sha256=' prefix if present
      const cleanSignature = signature.replace(/^sha256=/, '');
      
      // Calculate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');

      // Use constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(cleanSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      this.logger.error(`Signature verification error: ${error.message}`);
      return false;
    }
  }
}