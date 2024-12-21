import { Module } from '@nestjs/common';
import { AccessAuditLoggingService } from './access-audit-logging.service';

@Module({
  imports: [],
  providers: [AccessAuditLoggingService],
  exports: [AccessAuditLoggingService],
  controllers: [],
})
export class AccessAuditLoggingModule {
  static forRoot() {
    return {
      global: true,
      module: AccessAuditLoggingModule,
      providers: [AccessAuditLoggingService],
      exports: [AccessAuditLoggingService],
    };
  }
}
