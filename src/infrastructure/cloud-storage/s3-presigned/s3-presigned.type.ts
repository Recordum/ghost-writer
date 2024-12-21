export interface S3PresignedOptions {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface S3PresignedAsyncOptions {
  imports: any[];
  inject: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<S3PresignedOptions> | S3PresignedOptions;
}
