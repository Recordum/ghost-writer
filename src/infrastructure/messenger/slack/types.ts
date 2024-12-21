export type SlackOptions = {
  appToken: string;
  appTokenMrD: string;
  channel: string;
};

export type SlackAsyncOptions = {
  useFactory: (...args: any[]) => Promise<SlackOptions> | SlackOptions;
  inject?: any[];
  imports?: any[];
};
