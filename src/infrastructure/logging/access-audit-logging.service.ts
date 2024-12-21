import { Injectable, Logger } from '@nestjs/common';
import { IAccessAuditLogService } from './access-audit-logging.interface';
import { AdminAuditLogRepository } from '../persistence/repository';
import { AdminAuditLogEntity } from '../persistence/entity/logging';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AccessAuditLoggingService implements IAccessAuditLogService {
  private readonly accessLogger = new Logger('AccessLog');
  private readonly auditLogger = new Logger('AuditLog');
  constructor(
    private readonly adminAuditLogRepo: AdminAuditLogRepository,
    private readonly cls: ClsService,
  ) {}
  async saveAccessLog(prop: any): Promise<void> {
    // 구현 : DB에 저장하던, 파일에 저장하던, 다른 서비스로 전송
    this.accessLogger.log(JSON.stringify(prop));
  }
  async saveAuditLog(prop: any, isPermanent = false): Promise<void> {
    // 구현 : DB에 저장하던, 파일에 저장하던, 다른 서비스로 전송
    this.auditLogger.log(JSON.stringify(prop));

    if (isPermanent) {
      // DB에 저장 - 현재는 AdminAuditLogEntity만 저장
      if (prop.status === 'success' || prop.status === 'fail') {
        this.adminAuditLogRepo.update(
          {
            requestId: prop.requestId,
          },
          {
            status: prop.status,
            errorMessage: prop.error ?? null,
            errorStack: prop.error?.stack ?? null,
          },
        );
        return;
      }

      const adminAuditLog = new AdminAuditLogEntity();
      adminAuditLog.requestId = prop.requestId;
      adminAuditLog.method = prop.method;
      adminAuditLog.endpoint = prop.url;
      adminAuditLog.body = prop.body;
      adminAuditLog.requesterInfo = prop.adminInfo;
      adminAuditLog.networkInfo = {
        ip: prop.ip,
        userAgent: prop.userAgent,
      };
      adminAuditLog.status = prop.status;

      this.adminAuditLogRepo.save(adminAuditLog);
    }
  }
}
