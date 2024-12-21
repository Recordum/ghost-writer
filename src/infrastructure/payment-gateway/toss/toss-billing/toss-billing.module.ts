import { DynamicModule, Module } from '@nestjs/common';
import { TossBillingService } from './toss-billing.service';
import { TossBillingOptions } from './toss-billing.type';

@Module({})
export class TossBillingModule {
  static register(options: TossBillingOptions): DynamicModule {
    return {
      global: true,
      module: TossBillingModule,
      providers: [
        {
          provide: TossBillingService,
          useValue: new TossBillingService(options),
        },
      ],
      exports: [TossBillingService],
    };
  }
}
