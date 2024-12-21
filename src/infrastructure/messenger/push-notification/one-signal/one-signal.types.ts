export type OneSignalOptions = {
  appId: string;
  apiKey: string;
};

export type OneSignalAsyncOptions = {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => Promise<OneSignalOptions> | OneSignalOptions;
};
