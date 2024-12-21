import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3PresignedService {
  private bucket: string;
  private readonly client: S3Client;
  constructor(
    bucket: string,
    region: string,
    accessKeyId: string,
    secretAccessKey: string,
  ) {
    this.bucket = bucket;
    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  public async putPresignedUrl(
    key: string,
    md5?: string,
    expiresIn = 6000,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentMD5: md5 ? md5 : undefined,
    });

    return await getSignedUrl(this.client, command, {
      expiresIn: expiresIn,
    });
  }

  public async getPresignedUrl(key: string, expiresIn = 6000): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, {
      expiresIn: expiresIn,
    });
  }
}
