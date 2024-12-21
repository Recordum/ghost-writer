import { Module } from '@nestjs/common';
import { OneSignalAsyncOptions, OneSignalOptions } from './one-signal.types';
import { OneSignalService } from './one-signal.service';

@Module({})
export class OneSignalModule {
  static register(providerName: string, options: OneSignalOptions) {
    const OneSignalProvider = `OneSignal-${providerName}`;
    return {
      global: true,
      module: OneSignalModule,
      providers: [
        {
          provide: OneSignalProvider,
          useValue: new OneSignalService(options),
        },
      ],
      exports: [OneSignalProvider],
    };
  }

  static registerAsync(providerName: string, options: OneSignalAsyncOptions) {
    const OneSignalProvider = `OneSignal-${providerName}`;
    return {
      global: true,
      module: OneSignalModule,
      providers: [
        {
          provide: OneSignalProvider,
          useFactory: async (...args: any[]) => {
            const option = await options.useFactory(...args);
            return new OneSignalService(option);
          },
          inject: options.inject || [],
        },
      ],
      exports: [OneSignalProvider],
    };
  }
}
