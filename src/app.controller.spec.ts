import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return HTML content', () => {
      const result = appController.getHome();
      expect(result).toContain('JoonaPay Ledger Service');
      expect(result).toContain('<!DOCTYPE html>');
    });
  });
  
  describe('health', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result.status).toBe('healthy');
      expect(result.service).toBeDefined();
    });
  });
});
