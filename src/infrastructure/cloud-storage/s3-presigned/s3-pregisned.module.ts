import { DynamicModule, Module } from '@nestjs/common';
import {
  S3PresignedAsyncOptions,
  S3PresignedOptions,
} from './s3-presigned.type';
import { S3PresignedService } from './s3-presigned.service';

@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class S3PresignedModule {
  static register(options: S3PresignedOptions): DynamicModule {
    return {
      module: S3PresignedModule,
      providers: [
        {
          provide: S3PresignedService,
          useValue: new S3PresignedService(
            options.bucket,
            options.region,
            options.accessKeyId,
            options.secretAccessKey,
          ),
        },
      ],
      exports: [S3PresignedService],
    };
  }
  static registerAsync(options: S3PresignedAsyncOptions): DynamicModule {
    return {
      imports: options.imports || [],
      global: true,
      module: S3PresignedModule,
      providers: [
        {
          provide: S3PresignedService,
          useFactory: async (...args: any[]) => {
            const option = await options.useFactory(...args);
            return new S3PresignedService(
              option.bucket,
              option.region,
              option.accessKeyId,
              option.secretAccessKey,
            );
          },
          inject: options.inject || [],
        },
      ],
      exports: [S3PresignedService],
    };
  }
}
