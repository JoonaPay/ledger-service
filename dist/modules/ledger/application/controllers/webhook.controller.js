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
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const blnkfinance_service_1 = require("../../infrastructure/external/blnkfinance.service");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const crypto = require("crypto");
class BlnkWebhookDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Event type',
        example: 'transaction.completed',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BlnkWebhookDto.prototype, "event_type", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Event ID',
        example: 'evt_123456789',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BlnkWebhookDto.prototype, "event_id", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Event timestamp',
        example: '2024-01-01T10:00:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BlnkWebhookDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Event data',
        example: {
            account: {
                account_id: 'blnk_acc_123',
                balance: 1000.00,
                currency: 'USD'
            }
        },
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], BlnkWebhookDto.prototype, "data", void 0);
let WebhookController = WebhookController_1 = class WebhookController {
    constructor(blnkFinanceService, configService) {
        this.blnkFinanceService = blnkFinanceService;
        this.configService = configService;
        this.logger = new common_1.Logger(WebhookController_1.name);
        this.webhookSecret = this.configService.get('blnkfinance.webhookSecret', '');
    }
    async handleBlnkWebhook(webhookData, signature, contentType) {
        this.logger.log(`Received BlnkFinance webhook: ${webhookData.event_type} - ${webhookData.event_id}`);
        try {
            if (this.webhookSecret && signature) {
                const isValid = this.verifyWebhookSignature(JSON.stringify(webhookData), signature, this.webhookSecret);
                if (!isValid) {
                    this.logger.warn(`Invalid webhook signature for event: ${webhookData.event_id}`);
                    throw new common_1.UnauthorizedException('Invalid webhook signature');
                }
            }
            const event = {
                event_type: webhookData.event_type,
                event_id: webhookData.event_id,
                timestamp: webhookData.timestamp,
                data: webhookData.data,
            };
            await this.blnkFinanceService.handleWebhookEvent(event);
            this.logger.log(`BlnkFinance webhook processed successfully: ${webhookData.event_id}`);
            return {
                received: true,
                eventId: webhookData.event_id,
                eventType: webhookData.event_type,
                processedAt: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to process BlnkFinance webhook: ${error.message}`, error.stack);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Webhook processing failed: ${error.message}`);
        }
    }
    async testWebhook(testData, headers) {
        this.logger.log('Test webhook received');
        return {
            received: true,
            echo: testData,
            headers,
            timestamp: new Date().toISOString(),
        };
    }
    verifyWebhookSignature(payload, signature, secret) {
        try {
            const cleanSignature = signature.replace(/^sha256=/, '');
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(payload, 'utf8')
                .digest('hex');
            return crypto.timingSafeEqual(Buffer.from(cleanSignature, 'hex'), Buffer.from(expectedSignature, 'hex'));
        }
        catch (error) {
            this.logger.error(`Signature verification error: ${error.message}`);
            return false;
        }
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('blnk'),
    (0, swagger_1.ApiOperation)({
        summary: 'BlnkFinance webhook handler',
        description: 'Handles webhook events from BlnkFinance external service',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Blnk-Signature',
        description: 'Webhook signature for verification',
        required: true,
    }),
    (0, swagger_1.ApiBody)({ type: BlnkWebhookDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
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
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid webhook payload',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Invalid webhook signature',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-blnk-signature')),
    __param(2, (0, common_1.Headers)('content-type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BlnkWebhookDto, String, String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleBlnkWebhook", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, swagger_1.ApiOperation)({
        summary: 'Test webhook endpoint',
        description: 'Test endpoint for webhook development and debugging',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Test webhook received',
        schema: {
            type: 'object',
            properties: {
                received: { type: 'boolean' },
                echo: { type: 'object' },
                timestamp: { type: 'string' },
            },
        },
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "testWebhook", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, common_1.Controller)('api/v1/webhooks'),
    __metadata("design:paramtypes", [blnkfinance_service_1.BlnkFinanceService,
        config_1.ConfigService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map