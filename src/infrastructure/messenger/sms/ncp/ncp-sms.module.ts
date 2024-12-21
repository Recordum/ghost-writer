import { DynamicModule, Module } from '@nestjs/common';
import { NcpSmsAsyncOptions, NcpSmsOptions } from './ncp-sms.type';
import { NcpSmsService } from './ncp-sms.service';

@Module({})
export class NcpSmsModule {
  static register(options: NcpSmsOptions): DynamicModule {
    return {
      global: true,
      module: NcpSmsModule,
      providers: [
        {
          provide: NcpSmsService,
          useValue: new NcpSmsService(options),
        },
      ],
      exports: [NcpSmsService],
    };
  }

  static registerAsync(options: NcpSmsAsyncOptions): DynamicModule {
    return {
      global: true,
      module: NcpSmsModule,
      imports: options.imports || [],
      providers: [
        {
          provide: NcpSmsService,
          useFactory: async (...agrs: any[]) => {
            const option = await options.useFactory(...agrs);
            return new NcpSmsService(option);
          },
          inject: options.inject || [],
        },
      ],
      exports: [NcpSmsService],
    };
  }
}
