import { Module } from '@nestjs/common';
import { AccessAuditLoggingService } from './access-audit-logging.service';
import { UpdateLoggingService } from './update-logging.service';

@Module({
  imports: [],
  providers: [UpdateLoggingService],
  exports: [UpdateLoggingService],
  controllers: [],
})
export class UpdateLoggingModule {
  static forRoot() {
    return {
      global: true,
      module: UpdateLoggingModule,
      providers: [UpdateLoggingService],
      exports: [UpdateLoggingService],
    };
  }
}
