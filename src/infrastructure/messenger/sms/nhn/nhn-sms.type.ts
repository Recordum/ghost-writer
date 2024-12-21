export const NHN_REST_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
} as const;

export type NhnRestMethod =
  (typeof NHN_REST_METHOD)[keyof typeof NHN_REST_METHOD];

export interface NhnSmsOptions {
  appKey: string;
  secretKey: string;
  defaultSendNumber: string;
  blockCallNumber: string;
}

export interface NhnSmsAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => Promise<NhnSmsOptions> | NhnSmsOptions;
}

type MessageOptionsBase = {
  receivingNumber: string;
  subject: string;
  content: string;
  isAdvertising: boolean;
  sendingNumber?: string;
};

export type SendMessageOptions = MessageOptionsBase;

export type SendReserveMessageOptions = MessageOptionsBase & {
  reserveTime: string;
};

export type NhnSmsType = 'MMS' | 'AD-MMS';
