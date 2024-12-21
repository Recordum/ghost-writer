import { DynamicModule, Module } from '@nestjs/common';
import { NhnAlimtalkService } from './nhn-alimtalk.service';
import {
  NhnAlimtalkAsyncOptions,
  NhnAlimtalkOptions,
} from './nhn-alimtalk.type';

@Module({})
export class NhnAlimtalkModule {
  static register(options: NhnAlimtalkOptions): DynamicModule {
    return {
      global: true,
      module: NhnAlimtalkModule,
      providers: [
        {
          provide: NhnAlimtalkService,
          useValue: new NhnAlimtalkService(options),
        },
      ],
      exports: [NhnAlimtalkService],
    };
  }

  static registerAsync(options: NhnAlimtalkAsyncOptions): DynamicModule {
    return {
      global: true,
      module: NhnAlimtalkModule,
      imports: options.imports || [],
      providers: [
        {
          provide: NhnAlimtalkService,
          useFactory: async (...agrs: any[]) => {
            const option = await options.useFactory(...agrs);
            return new NhnAlimtalkService(option);
          },
          inject: options.inject || [],
        },
      ],
      exports: [NhnAlimtalkService],
    };
  }
}
