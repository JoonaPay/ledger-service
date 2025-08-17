import { ConfigService } from '@nestjs/config';
import { BlnkFinanceService } from '../../infrastructure/external/blnkfinance.service';
declare class BlnkWebhookDto {
    event_type: string;
    event_id: string;
    timestamp: string;
    data: any;
}
export declare class WebhookController {
    private readonly blnkFinanceService;
    private readonly configService;
    private readonly logger;
    private readonly webhookSecret;
    constructor(blnkFinanceService: BlnkFinanceService, configService: ConfigService);
    handleBlnkWebhook(webhookData: BlnkWebhookDto, signature?: string, contentType?: string): Promise<{
        received: boolean;
        eventId: string;
        eventType: string;
        processedAt: string;
    }>;
    testWebhook(testData: any, headers: Record<string, string>): Promise<{
        received: boolean;
        echo: any;
        headers: Record<string, string>;
        timestamp: string;
    }>;
    private verifyWebhookSignature;
}
export {};
