import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import * as fs from 'fs';

/**
 * 환경변ㄴ수에 따라 .env 파일을 선택하는 함수 production일 경우에는
 */
function getEnvPath() {
  let path;
  if (process.env.NODE_ENV === 'production') {
    path = '.env.production';
  } else if (process.env.NODE_ENV === 'development') {
    path = '.env.development';
  } else if (process.env.NODE_ENV === 'test') {
    path = '.env.test';
  } else {
    throw new Error('NODE_ENV is not set');
  }
  return path;
}

/**
 * rds 접속정보를 가져오는 함수
 * production일 경우 rds 접속정보를 가져오기 위해 AWS SecretManager를 사용한다.
 */
async function getSecrete(accessKeyId: string, secretAccessKey: string) {
  const secret_name = 'rds!db-26c5db6a-6a28-44a5-ad6a-e3c8f3836ae4';
  const client = new SecretsManagerClient({
    region: 'ap-northeast-2',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: 'AWSCURRENT',
      }),
    );

    const secrete = JSON.parse(response.SecretString);

    if (!secrete.username || !secrete.password) {
      throw new Error('username or password is not exist');
    }

    return {
      username: secrete.username,
      password: secrete.password,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * production일 경우 rds와 연결하기 위해 ssl 설정을 해야함
 */
function ssl(env: string) {
  if (env === 'production') {
    return {
      ca: fs.readFileSync(`./global-bundle.pem`).toString(),
    };
  }
  return undefined;
}

function getConfigOrThrow() {
  const path = getEnvPath();
  const {
    AWS_SSM_ACCESS_KEY_ID: accessKeyId,
    AWS_SSM_SECRET_ACCESS_KEY: secretAccessKey,
    DB_USER: dbUser,
    DB_PASSWORD: dbPassword,
    DB_HOST: dbHost,
    DB_PORT: dbPort,
    DB_DATABASE: dbDatabase,
  } = config({
    path,
  }).parsed;

  // 하나라도 undefined일 경우 에러
  if (
    !accessKeyId ||
    !secretAccessKey ||
    !dbUser ||
    !dbPassword ||
    !dbHost ||
    !dbPort ||
    !dbDatabase
  ) {
    throw new Error('env value is not exist');
  }

  return {
    ssmKey: {
      accessKeyId,
      secretAccessKey,
    },
    dbInfo: {
      dbUser,
      dbPassword,
      dbHost,
      dbPort: Number(dbPort),
      dbDatabase,
    },
  };
}

function getHostByEnv(dbHost: string, env: string) {
  if (env === 'development') {
    return 'localhost';
  }
  return dbHost;
}

/**
 * 이옵션을 기반으로 연결된 DB와 소스코드의 Entity를 비교하여 migration 파일을 생성한다.
 * production 일경우
 * - rds 접속정보를 가져오기 위해 AWS SecretManager를 사용한다.
 * - ssl통신을 사용한다
 */
async function createConnectOptions() {
  const { ssmKey, dbInfo } = getConfigOrThrow();

  console.log(ssmKey, 'ssm Key');
  console.log(dbInfo, 'db Info');

  const env = process.env.ENV;

  /**
   * DB username / password를 env 에따라 결정
   * production일 경우 rds 접속정보를 가져오기 위해 AWS SecretManager를 사용한다
   * production이 아닐경우 .env 파일에서 가져온다.
   */
  const { accessKeyId, secretAccessKey } = ssmKey;
  const { dbUser, dbPassword, dbHost, dbPort, dbDatabase } = dbInfo;

  let username: string;
  let password: string;
  if (env === 'production') {
    const res = await getSecrete(accessKeyId, secretAccessKey);
    username = res.username;
    password = res.password;
  } else {
    username = dbUser;
    password = dbPassword;
  }

  const host = getHostByEnv(dbHost, env); //development에서는 localhost로 연결

  const connectionOptions: DataSourceOptions = {
    type: 'postgres',
    host,
    port: dbPort,
    username,
    password,
    database: dbDatabase,
    synchronize: false,
    logging: true,
    ssl: ssl(env),
    namingStrategy: new SnakeNamingStrategy(),
    entities: [__dirname + './../../**/*.entity{.ts,.js}'],
    migrations: ['src/infrastructure/config/typeorm/migrations/*{.ts,.js}'],
  };

  return connectionOptions;
}

async function setupDataSource() {
  const options = await createConnectOptions();
  return new DataSource(options);
}

export default setupDataSource();
