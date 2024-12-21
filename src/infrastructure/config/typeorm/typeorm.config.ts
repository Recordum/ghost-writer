import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { addTransactionalDataSource } from 'typeorm-transactional';
import * as fs from 'fs';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

function ssl(configService: ConfigService) {
  if (configService.getOrThrow<string>('ENV') === 'production') {
    return {
      ca: fs.readFileSync(`./global-bundle.pem`).toString(),
    };
  }
  return undefined;
}

async function getDatabaseAuth(configService: ConfigService) {
  const SECRET_ID = 'rds!db-26c5db6a-6a28-44a5-ad6a-e3c8f3836ae4';

  const env = configService.getOrThrow<string>('ENV');
  if (env !== 'production')
    return {
      username: configService.getOrThrow<string>('DB_USER'),
      password: configService.getOrThrow<string>('DB_PASSWORD'),
    };

  // Production인 경우 Secret Manager를 통해 DB 인증 정보를 가져온다.
  const accessKeyId = configService.getOrThrow<string>('AWS_SSM_ACCESS_KEY_ID');
  const secretAccessKey = configService.getOrThrow<string>(
    'AWS_SSM_SECRET_ACCESS_KEY',
  );

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
        SecretId: SECRET_ID,
        VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
      }),
    );
    const secret = JSON.parse(response.SecretString);
    return {
      username: secret.username,
      password: secret.password,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const { username, password } = await getDatabaseAuth(configService);
    return {
      type: 'postgres',
      host: configService.getOrThrow<string>('DB_HOST'),
      port: configService.getOrThrow<number>('DB_PORT'),
      database: configService.getOrThrow<string>('DB_DATABASE'),
      username: username,
      password: password,
      synchronize:
        configService.getOrThrow<string>('DB_SYNCHRONIZE') === 'true'
          ? true
          : false,
      logging:
        configService.getOrThrow<string>('DB_LOGGING') === 'true'
          ? true
          : false,
      ssl: ssl(configService),
      autoLoadEntities: true, // 추후에 production에서는 바꾸는게 좋을지 고려해보기
      entities: [__dirname + './../../persistence/entity/**/*.entity{.ts,.js}'],
      useUTC: true,
      namingStrategy: new SnakeNamingStrategy(),
    };
  },
  async dataSourceFactory(options) {
    if (!options) {
      throw new Error('Invalid options passed');
    }
    return addTransactionalDataSource(new DataSource(options));
  },
};
