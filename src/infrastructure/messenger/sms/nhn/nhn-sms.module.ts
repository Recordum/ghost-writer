import { DynamicModule, Module } from '@nestjs/common';
import { NhnSmsAsyncOptions, NhnSmsOptions } from './nhn-sms.type';
import { NhnSmsService } from './nhn-sms.service';

@Module({})
export class NhnSmsModule {
  static register(options: NhnSmsOptions): DynamicModule {
    return {
      global: true,
      module: NhnSmsModule,
      providers: [
        {
          provide: NhnSmsService,
          useValue: new NhnSmsService(options),
        },
      ],
      exports: [NhnSmsService],
    };
  }

  static registerAsync(options: NhnSmsAsyncOptions): DynamicModule {
    return {
      global: true,
      module: NhnSmsModule,
      imports: options.imports || [],
      providers: [
        {
          provide: NhnSmsService,
          useFactory: async (...args: any[]) => {
            const option = await options.useFactory(...args);
            return new NhnSmsService(option);
          },
          inject: options.inject || [],
        },
      ],
      exports: [NhnSmsService],
    };
  }
}
