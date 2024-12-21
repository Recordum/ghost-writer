import { DynamicModule, Module } from '@nestjs/common';
import {
  NcpAlimtalkAsyncOptions,
  NcpAlimtalkOptions,
} from './ncp-alimtalk.type';
import { NcpAlimtalkService } from './ncp-alimtalk.service';

@Module({})
export class NcpAlimtalkModule {
  static register(options: NcpAlimtalkOptions): DynamicModule {
    return {
      global: true,
      module: NcpAlimtalkModule,
      providers: [
        {
          provide: NcpAlimtalkService,
          useValue: new NcpAlimtalkService(options),
        },
      ],
      exports: [NcpAlimtalkService],
    };
  }

  static registerAsync(options: NcpAlimtalkAsyncOptions): DynamicModule {
    return {
      global: true,
      module: NcpAlimtalkModule,
      imports: options.imports || [],
      providers: [
        {
          provide: NcpAlimtalkService,
          useFactory: async (...args: any[]) => {
            const option = await options.useFactory(...args);
            const data = new NcpAlimtalkService(option);
            return data;
          },
          inject: options.inject || [],
        },
      ],
      exports: [NcpAlimtalkService],
    };
  }
}
