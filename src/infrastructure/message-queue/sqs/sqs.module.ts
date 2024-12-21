import {
  DynamicModule,
  Global,
  Module,
  Provider,
  Logger,
} from '@nestjs/common';
import { SqsService } from './sqs.service';
import { SqsOptions } from './sqs.types';
import { SQS_OPTIONS } from './sqs.constants';
import { SqsRouter } from './sqs.router';
import {
  DiscoveryModule,
  DiscoveryService,
} from 'src/infrastructure/discovery';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [SqsService, SqsRouter],
  exports: [SqsService],
})
export class SqsModule {
  private readonly logger = new Logger('SqsModule', { timestamp: false });

  public static register(options: SqsOptions): DynamicModule {
    const sqsOptions: Provider = {
      provide: SQS_OPTIONS,
      useValue: options,
    };

    const sqsProvider: Provider = {
      provide: SqsService,
      useFactory: (
        sqsOptions: SqsOptions,
        discover: DiscoveryService,
        messageRouter: SqsRouter,
      ) => new SqsService(sqsOptions, discover, messageRouter),
      inject: [SQS_OPTIONS, DiscoveryService, SqsRouter],
    };

    return {
      global: true,
      module: SqsModule,
      imports: [],
      providers: [sqsOptions, sqsProvider],
      exports: [sqsProvider],
    };
  }

  // public static registerAsync(options: SqsModuleAsyncOptions): DynamicModule {
  //   const asyncProviders = this.createAsyncProviders(options);
  //   const sqsProvider: Provider = {
  //     provide: SqsService,
  //     useFactory: (
  //       options: SqsOptions,
  //       // discover: DiscoveryService,
  //       messageRouter: SqsRouter,
  //     ) => new SqsService(options, messageRouter),
  //     //   ) => new SqsService(options, discover, messageRouter),
  //     inject: [SQS_OPTIONS, SqsRouter],
  //   };

  //   return {
  //     global: true,
  //     module: SqsModule,
  //     imports: [DiscoveryModule, ...(options.imports ?? [])],
  //     providers: [...asyncProviders, sqsProvider],
  //     exports: [sqsProvider],
  //   };
  // }

  // private static createAsyncProviders(
  //   options: SqsModuleAsyncOptions,
  // ): Provider[] {
  //   if (options.useExisting || options.useFactory) {
  //     return [this.createAsyncOptionsProvider(options)];
  //   }

  //   const useClass = options.useClass as Type<SqsModuleOptionsFactory>;
  //   return [
  //     this.createAsyncOptionsProvider(options),
  //     {
  //       provide: useClass,
  //       useClass,
  //     },
  //   ];
  // }

  // private static createAsyncOptionsProvider(
  //   options: SqsModuleAsyncOptions,
  // ): Provider {
  //   if (options.useFactory) {
  //     return {
  //       provide: SQS_OPTIONS,
  //       useFactory: options.useFactory,
  //       inject: options.inject || [],
  //     };
  //   }

  //   const inject = [
  //     (options.useClass ||
  //       options.useExisting) as Type<SqsModuleOptionsFactory>,
  //   ];
  //   return {
  //     provide: SQS_OPTIONS,
  //     useFactory: async (optionsFactory: SqsModuleOptionsFactory) =>
  //       await optionsFactory.createOptions(),
  //     inject,
  //   };
  // }
}
