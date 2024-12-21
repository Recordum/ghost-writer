export const NCP_REST_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

export type NcpRestMethod =
  (typeof NCP_REST_METHOD)[keyof typeof NCP_REST_METHOD];

export interface NcpSmsOptions {
  accessKey: string;
  secretKey: string;
  serviceId: string;
  blockCallNumber: string;
  defaultSendNumber: string;
}

export interface NcpSmsAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => Promise<NcpSmsOptions> | NcpSmsOptions;
}

export const NCP_SMS_TYPE = {
  AD: 'AD',
  COMM: 'COMM',
} as const;

export type NcpSmsType = (typeof NCP_SMS_TYPE)[keyof typeof NCP_SMS_TYPE];

export type SendMessageOptions = {
  receivingNumber: string; // 수신 번호
  subject: string;
  content: string;
  isAdvertising: boolean;
  sendingNumber?: string; // 발신번호 - 기본값은 defaultSendNumber - NCP에서 가져오기
};

export type ReserveMessageOptions = SendMessageOptions & {
  reserveTime: string;
};
