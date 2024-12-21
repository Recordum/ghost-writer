import {
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 스크립트 실행 : yarn migration-run:{env} ex) yarn migration-run:test
 *
 * migration을 실행시키기 위한 스크립트 환경변수에 따라 migration 파일을 생성하고 실행한다.
 * 1. migration 파일 생성
 * 2. migration 파일 실행
 * 3. s3에 migration 파일 업로드
 * 4. 로컬에 생성된 migration 파일 삭제
 */
async function execute() {
  try {
    //migration 파일 생성
    // console.log('Generating migration...');
    // await exec('yarn migration:generate');
    // console.log('Migration generated successfully.');

    //migration 실행
    // console.log('Running migration...');
    // await exec('yarn migration:run');
    // console.log('Migration run successfully.');

    //로켈이 있는 migration 파일 중 가장 최근 파일 찾기
    const filePath = getLatestMigrationFile(dirPath);

    //s3에 migration 파일 업로드
    await uploadMigrationFile(filePath);

    //로컬에 생성된 migration 파일 삭제
    // deleteLocalFile(filePath);
  } catch (error) {
    console.error('An error occurred during the process:', error);
  }
}
//============================================================================
/**
 * s3에 업로드/다운로드를 위한 클라이언트 생성
 * todo: secretKey/ accessKey를 관리하는 다른 방법을 찾아야함
 */

const client = new S3Client(input);

// const exec = promisify(execCallback);
const dirPath = './src/infrastructure/config/typeorm/migrations';

/**
 * s3에 마이그레이션 파일 업로드
 * @param filePath
 */
async function uploadMigrationFile(filePath: string) {
  const env = process.env.ENV;
  const migrationFile = fs.readFileSync(filePath);
  const migrationFileName = path.basename(filePath);
  await client.send(
    new PutObjectCommand({
      Bucket: input.bucket,
      Key: `${env}-v2/${migrationFileName}`,
      Body: migrationFile,
    }),
  );
}

/**
 * 로컬에 있는 migration 파일 중 가장 최근 파일 찾기
 * @param directory
 * @returns
 */
function getLatestMigrationFile(directory: string): string {
  const files = fs.readdirSync(directory);
  if (files.length === 0) {
    throw new Error('No migration files found.');
  }

  let latestFile = '';
  let latestTime = 0;
  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    if (stats.mtimeMs > latestTime) {
      // 수정 시간 비교
      latestTime = stats.mtimeMs;
      latestFile = filePath;
    }
  });

  return latestFile;
}

function deleteLocalFile(filePath: string) {
  fs.unlinkSync(filePath);

  console.log('Local migration file deleted');
}

execute();
