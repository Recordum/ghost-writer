import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { last } from 'lodash';
import { Readable } from 'stream'; // Import the Readable class from the 'stream' module
/**
 * 스크립트 실행: yarn migration-revert:{env} ex) yarn migration-revert:test
 *
 * migration파일로 변경한 db스키마를 이전버전으로 되돌리는 스크립트
 * 1. s3에서 가장 최근 migration 파일을 찾아서 다운로드
 * 2. migration revert 실행
 */
async function execute() {
  try {
    //s3에서 파일 다운로드
    const latestFile = await findLatestFile();
    console.log(`migration Key: ${latestFile}`);
    await downloadMigrationFile(latestFile);
    //revert migration
    // await exec('yarn migration:revert');
  } catch (error) {
    console.error('An error occurred during the process:', error);
  }
}

//========================================================================
/**
 * s3에 업로드/다운로드를 위한 클라이언트 생성
 * todo: secretKey/ accessKey를 관리하는 다른 방법을 찾아야함
 */

const client = new S3Client(input);

// const exec = promisify(execCallback);
const dirPath = './src/infrastructure/config/typeorm/migrations';

/**
 * s3에 업로드된 파일 중 가장 최근 파일 찾기
 * ex) test DB 마이그레이션 파일중 가장 최근 파일을 찾아서 다운로드 받는다.
 * @returns
 */
async function findLatestFile() {
  const env = process.env.NODE_ENV;
  const listParams = {
    Bucket: input.bucket,
    Prefix: `${env}-v2`,
  };

  try {
    const data = await client.send(new ListObjectsV2Command(listParams));
    if (!data.Contents || data.Contents.length === 0) {
      throw new Error('No files found in the directory.');
    }

    // 가장 최근 파일 찾기
    let latestFile = data.Contents[0];
    data.Contents.forEach((file) => {
      if (file.LastModified > latestFile.LastModified) {
        latestFile = file;
      }
    });

    return latestFile.Key;
  } catch (error) {
    console.error('Error finding the latest file:', error);
    throw error;
  }
}

/**
 * s3에 업로드된 마이그레이션 파일 다운로드
 * @param key
 */
async function downloadMigrationFile(key: string) {
  const env = process.env.NODE_ENV;

  const command = new GetObjectCommand({
    Bucket: input.bucket,
    Key: `${key}`,
  });
  const filName = key.split('/').pop();
  const fileStream = fs.createWriteStream(dirPath + `/${filName}`);

  const { Body } = await client.send(command);

  //받은 데이터를 파일로 저장
  const readableStream = Body as Readable;
  readableStream.pipe(fileStream);
}

execute();
