import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AccessAuditLoggingService } from '../logging/access-audit-logging.service';
import { ClsService } from 'nestjs-cls';
import { Reflector } from '@nestjs/core';
import { UpdateLoggingService } from '../logging/update-logging.service';
import { HousekeepingSubscriptionRepository } from '../persistence/repository';
import { Resource } from '../persistence/entity/logging/update-log.entity';

@Injectable()
export class AuditLoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly logService: AccessAuditLoggingService,
    private readonly cls: ClsService,
  ) {}
  private readonly auditMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, headers } = request;
    const userAgent = headers['user-agent'] || '';

    // Audit에 해당하지 않는 것들은 pass
    if (!this.auditMethods.includes(method)) {
      return next.handle().pipe(
        catchError((error) => {
          this.logService.saveAccessLog({
            requestId: this.cls.get('requestId'),
            status: 'fail',
          });
          return throwError(() => error);
        }),
        tap(() => {
          if (userAgent === 'ELB-HealthChecker/2.0') return;
          this.logService.saveAccessLog({
            requestId: this.cls.get('requestId'),
            status: 'success',
          });
        }),
      );
    }

    this.logService.saveAuditLog(
      {
        requestId: this.cls.get('requestId'),
        method: this.cls.get('method'),
        url: this.cls.get('url'),
        body: request.body,
        userInfo: this.cls.get('userInfo'),
        workerInfo: this.cls.get('workerInfo'),
        adminInfo: this.cls.get('adminInfo'),
        bpAdminInfo: this.cls.get('bpAdminInfo'),
        userAgent: this.cls.get('userAgent'),
        ip: this.cls.get('ip'),
        status: 'pending',
      },
      !!this.cls.get('adminInfo'), // bpAdminInfo가 있으면 DB에 저장
    );

    return next.handle().pipe(
      catchError((error) => {
        this.logService.saveAuditLog(
          {
            requestId: this.cls.get('requestId'),
            bpAdminInfo: this.cls.get('bpAdminInfo'),
            status: 'fail',
            error,
          },
          !!this.cls.get('adminInfo'),
        );
        return throwError(() => error);
      }),
      tap(() => {
        this.logService.saveAuditLog(
          {
            requestId: this.cls.get('requestId'),
            status: 'success',
          },
          !!this.cls.get('adminInfo'),
        );
      }),
    );
  }
}

//=============특정 자원이 업데이트될떄 로깅을 남기는 인터셉터=============
/**
 * 데코레이터로 어떤 자원이 업데이트되었는지, 어떤 상세 내용이 업데이트되었는지를 전달
 * @param resource
 * @param detail
 * @returns
 */
export const LoggingUpdate = (
  resource: Resource,
  detail: string,
  isCreate?: boolean,
) => SetMetadata('logging', { resource, detail, isCreate });

/**
 * 특정 자원이 업데이트 될떄 로깅을 남기는 인터셉터
 */
@Injectable()
export class UpdateLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logService: UpdateLoggingService,
    private readonly cls: ClsService,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, headers } = request;
    const userAgent = headers['user-agent'] || '';

    const loggingMeta = this.reflector.get<{
      resource: Resource;
      detail: string;
      isCreate?: boolean;
    }>('logging', context.getHandler());

    if (!loggingMeta) return next.handle();

    const isCreate = loggingMeta.isCreate ? true : false;
    const updaterInfo = this.setUpdaterInfo();

    await this.logService.saveUpdateLog({
      requestId: this.cls.get('requestId'),
      loggingMeta,
      body: request.body,
      updaterInfo,
      status: 'pending',
      isCreate,
    });

    return next.handle().pipe(
      catchError((error) => {
        this.logService.saveResult({
          requestId: this.cls.get('requestId'),
          status: 'fail',
          loggingMeta,
        });
        return throwError(() => error);
      }),
      tap(async (result) => {
        if (isCreate && result && result.id) {
          await this.logService.updateLogWithResourceId({
            requestId: this.cls.get('requestId'),
            status: 'success',
            loggingMeta,
            resourceId: result.id,
          });
          return;
        }
        await this.logService.saveResult({
          requestId: this.cls.get('requestId'),
          status: 'success',
          loggingMeta,
        });
      }),
    );
  }

  private setUpdaterInfo() {
    const userInfo = this.cls.get('userInfo');
    const workerInfo = this.cls.get('workerInfo');
    const adminInfo = this.cls.get('adminInfo');
    const bpAdminInfo = this.cls.get('bpAdminInfo');

    if (userInfo) {
      return {
        userId: userInfo.userId,
        name: userInfo.name,
      };
    } else if (workerInfo) {
      return {
        workerId: workerInfo.workerId,
        name: workerInfo.name,
      };
    } else if (adminInfo) {
      return {
        adminId: adminInfo.adminId,
        name: adminInfo.name,
      };
    }

    throw new Error('UpdaterInfo is not found');
  }
}
