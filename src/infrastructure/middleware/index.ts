import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { AccessAuditLoggingService } from '../logging/access-audit-logging.service';
import { ClsService } from 'nestjs-cls';
@Injectable()
export class AccessLoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly logService: AccessAuditLoggingService,
    private readonly cls: ClsService,
  ) {}
  async use(request: Request, res: any, next: NextFunction) {
    const { url, method, headers, hostname } = request;
    const userAgent = headers['user-agent'] || '';
    if (userAgent === 'ELB-HealthChecker/2.0') {
      return next();
    } // ELB-HealthChecker/2.0 (AWS ELB Health Check)

    const origin = headers['origin'] ? headers['origin'] : '';
    const requestId = headers['X-request-id'] ?? this.uuid();
    const ip = headers['x-forwarded-for'] ?? headers['x-real-ip'];

    // cls 세팅
    this.cls.set('requestId', requestId);
    this.cls.set('ip', ip);
    this.cls.set('url', url);
    this.cls.set('method', method);
    this.cls.set('userAgent', userAgent);
    this.cls.set('origin', origin);

    this.logService.saveAccessLog({
      requestId,
      method,
      url,
      userAgent,
      ip,
      origin,
    });
    next();
  }

  private uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        // eslint-disable-next-line no-bitwise
        const r = (Math.random() * 16) | 0;
        // eslint-disable-next-line no-bitwise
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}
