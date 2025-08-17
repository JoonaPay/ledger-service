import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
export declare class AppController {
    private readonly appService;
    private readonly configService;
    constructor(appService: AppService, configService: ConfigService);
    getHome(): string;
    getHealth(): {
        status: string;
        timestamp: string;
        service: any;
        environment: any;
        uptime: number;
        memory: NodeJS.MemoryUsage;
    };
}
