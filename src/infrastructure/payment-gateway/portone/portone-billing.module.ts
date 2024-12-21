import { DynamicModule, Module } from '@nestjs/common';
import {
  PortoneBillingAsyncOptions,
  PortoneBillingOption,
} from './portone-billig.types';
import { PortoneBillingService } from './portone-billing.service';

@Module({})
export class PortoneBillingModule {
  static register(options: PortoneBillingOption): DynamicModule {
    return {
      global: true,
      module: PortoneBillingModule,
      providers: [
        {
          provide: PortoneBillingService,
          useValue: new PortoneBillingService(options),
        },
      ],
      exports: [PortoneBillingService],
    };
  }

  static registerAsync(options: PortoneBillingAsyncOptions): DynamicModule {
    return {
      imports: options.imports || [],
      global: true,
      module: PortoneBillingModule,
      providers: [
        {
          provide: PortoneBillingService,
          useFactory: async (...args: any[]) => {
            const option = await options.useFactory(...args);
            return new PortoneBillingService(option);
          },
          inject: options.inject || [],
        },
      ],
      exports: [PortoneBillingService],
    };
  }
}
