export enum ConfigMode {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

// export class ConfigService {
//   get mode(): ConfigMode {
//     return (process.env.NODE_ENV as ConfigMode) || ConfigMode.LOCAL;
//   }
// }
