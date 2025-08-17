import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Header('Content-Type', 'text/html')
  @ApiExcludeEndpoint()
  getHome(): string {
    const appName = this.configService.get('appName', 'JoonaPay Ledger Service');
    const nodeEnv = this.configService.get('nodeEnv', 'development');
    const port = this.configService.get('port', 3001);
    
    const services = [
      {
        name: 'Database',
        status: 'connected',
        icon: '🗄️',
        url: 'PostgreSQL'
      },
      {
        name: 'Kafka',
        status: 'connected',
        icon: '📬',
        url: this.configService.get('kafka.brokers', ['localhost:9092']).join(', ')
      },
      {
        name: 'Redis',
        status: 'connected',
        icon: '⚡',
        url: this.configService.get('redis.url', 'redis://localhost:6379')
      },
      {
        name: 'BlnkFinance',
        status: this.configService.get('blnkfinance.apiKey') ? 'configured' : 'not configured',
        icon: '💰',
        url: this.configService.get('blnkfinance.url', 'Not configured')
      }
    ];

    const features = [
      { name: 'Account Management', icon: '🏦', description: 'Create and manage user and system accounts' },
      { name: 'Double-Entry Bookkeeping', icon: '📊', description: 'Full double-entry accounting system' },
      { name: 'Multi-Currency Support', icon: '💱', description: 'Support for multiple currencies' },
      { name: 'Real-time Transactions', icon: '⚡', description: 'Process transactions in real-time' },
      { name: 'BlnkFinance Integration', icon: '🔗', description: 'Integrated with BlnkFinance ledger API' },
      { name: 'Event-Driven Architecture', icon: '📡', description: 'Kafka-based event streaming' },
    ];

    const endpoints = [
      { method: 'GET', path: '/', description: 'Service home page' },
      { method: 'GET', path: '/health', description: 'Health check endpoint' },
      { method: 'GET', path: '/metrics', description: 'Prometheus metrics (text format)' },
      { method: 'GET', path: '/metrics/json', description: 'Metrics in JSON format' },
      { method: 'GET', path: '/metrics/health', description: 'Health metrics endpoint' },
      { method: 'GET', path: '/api', description: 'Swagger API documentation' },
      { method: 'POST', path: '/api/accounts', description: 'Create new account' },
      { method: 'GET', path: '/api/accounts/:id', description: 'Get account details' },
      { method: 'GET', path: '/api/accounts/user/:userId', description: 'Get user accounts' },
      { method: 'POST', path: '/api/transactions/transfer', description: 'Transfer funds between accounts' },
      { method: 'POST', path: '/api/transactions/deposit', description: 'Deposit funds to account' },
      { method: 'POST', path: '/api/transactions/withdraw', description: 'Withdraw funds from account' },
      { method: 'GET', path: '/api/transactions/:id', description: 'Get transaction details' },
      { method: 'GET', path: '/api/accounts/:id/transactions', description: 'Get account transaction history' },
    ];

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName} - JoonaPay</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .logo-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
        }
        
        h1 {
            color: #2d3748;
            font-size: 2.5rem;
            font-weight: 700;
        }
        
        .subtitle {
            color: #718096;
            font-size: 1.1rem;
            margin-top: 0.5rem;
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-left: 1rem;
        }
        
        .status-development {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-production {
            background: #d1fae5;
            color: #065f46;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }
        
        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
        }
        
        .services-list, .features-list {
            list-style: none;
        }
        
        .service-item, .feature-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem;
            margin: 0.5rem 0;
            background: #f7fafc;
            border-radius: 8px;
            transition: background 0.2s;
        }
        
        .service-item:hover, .feature-item:hover {
            background: #edf2f7;
        }
        
        .service-info, .feature-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .service-icon, .feature-icon {
            font-size: 1.5rem;
        }
        
        .feature-description {
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 0.25rem;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 0.5rem;
            display: inline-block;
        }
        
        .status-configured, .status-connected {
            background: #10b981;
        }
        
        .status-not-configured {
            background: #ef4444;
        }
        
        .endpoints-table {
            width: 100%;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .endpoints-header {
            background: #f7fafc;
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .endpoints-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
        }
        
        .endpoint-row {
            display: flex;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            transition: background 0.2s;
        }
        
        .endpoint-row:hover {
            background: #f7fafc;
        }
        
        .endpoint-row:last-child {
            border-bottom: none;
        }
        
        .method-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-right: 1rem;
            min-width: 60px;
            text-align: center;
        }
        
        .method-get {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .method-post {
            background: #d1fae5;
            color: #065f46;
        }
        
        .endpoint-path {
            font-family: 'Monaco', 'Courier New', monospace;
            color: #4b5563;
            margin-right: 1rem;
            flex: 1;
        }
        
        .endpoint-description {
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(46, 204, 113, 0.4);
        }
        
        .btn-secondary {
            background: white;
            color: #2ECC71;
            border: 2px solid #2ECC71;
        }
        
        .btn-secondary:hover {
            background: #2ECC71;
            color: white;
        }
        
        .footer {
            text-align: center;
            color: white;
            margin-top: 3rem;
            padding: 2rem;
        }
        
        .footer a {
            color: white;
            text-decoration: none;
            font-weight: 600;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            h1 {
                font-size: 1.75rem;
            }
            
            .grid {
                grid-template-columns: 1fr;
            }
            
            .endpoint-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .endpoint-path {
                margin-right: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">💰</div>
                <div>
                    <h1>JoonaPay Ledger Service</h1>
                    <div class="subtitle">
                        Core Accounting & Financial Ledger Management
                        <span class="status-badge status-${nodeEnv}">${nodeEnv.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            
            <div class="actions">
                <a href="/api" class="btn btn-primary">
                    📚 API Documentation
                </a>
                <a href="/health" class="btn btn-secondary">
                    ❤️ Health Check
                </a>
                <a href="/metrics/json" class="btn btn-secondary">
                    📊 Metrics
                </a>
            </div>
        </div>
        
        <div class="grid">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">🔧 Connected Services</h2>
                </div>
                <ul class="services-list">
                    ${services.map(service => `
                    <li class="service-item">
                        <div class="service-info">
                            <span class="service-icon">${service.icon}</span>
                            <span>${service.name}</span>
                        </div>
                        <span>
                            <span class="status-dot status-${service.status === 'connected' || service.status === 'configured' ? 'configured' : 'not-configured'}"></span>
                            ${service.status}
                        </span>
                    </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">✨ Core Features</h2>
                </div>
                <ul class="features-list">
                    ${features.map(feature => `
                    <li class="feature-item">
                        <div class="feature-info">
                            <span class="feature-icon">${feature.icon}</span>
                            <div>
                                <div>${feature.name}</div>
                                <div class="feature-description">${feature.description}</div>
                            </div>
                        </div>
                    </li>
                    `).join('')}
                </ul>
            </div>
        </div>
        
        <div class="endpoints-table">
            <div class="endpoints-header">
                <h2 class="endpoints-title">🚀 Available Endpoints</h2>
            </div>
            ${endpoints.map(endpoint => `
            <div class="endpoint-row">
                <span class="method-badge method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <span class="endpoint-path">${endpoint.path}</span>
                <span class="endpoint-description">${endpoint.description}</span>
            </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>
                ${appName} v1.0.0 | Running on port ${port}
            </p>
            <p style="margin-top: 1rem;">
                Built with ❤️ by <a href="https://joonapay.com" target="_blank">JoonaPay</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;

    return html;
  }

  @Get('health')
  @ApiExcludeEndpoint()
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: this.configService.get('appName', 'JoonaPay Ledger Service'),
      environment: this.configService.get('nodeEnv', 'development'),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
