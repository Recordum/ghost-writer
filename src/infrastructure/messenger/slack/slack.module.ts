import { DynamicModule, Module } from '@nestjs/common';
import { SlackAsyncOptions, SlackOptions } from './types';
import { SlackService } from './slack.service';

@Module({})
export class SlackModule {
  static register(options: SlackOptions): DynamicModule {
    return {
      global: true,
      module: SlackModule,
      providers: [
        {
          provide: SlackService,
          useValue: new SlackService(options),
        },
      ],
      exports: [SlackService],
    };
  }

  static registerAsync(options: SlackAsyncOptions): DynamicModule {
    return {
      global: true,
      module: SlackModule,
      imports: options.imports || [],
      providers: [
        {
          provide: SlackService,
          useFactory: async (...args: any[]) => {
            const option = await options.useFactory(...args);
            const data = new SlackService(option);
            return data;
          },
          inject: options.inject || [],
        },
      ],
      exports: [SlackService],
    };
  }
}
