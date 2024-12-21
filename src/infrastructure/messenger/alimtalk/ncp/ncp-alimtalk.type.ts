export type NcpAlimtalkOptions = {
  accessKey: string;
  plusFriendId: string;
  serviceId: string;
  secretKey: string;
};

export interface NcpAlimtalkAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<NcpAlimtalkOptions> | NcpAlimtalkOptions;
}

export type SendNcpAlimtalkOptions = {
  templateCode: string;
  to: string;
  content: string;
  button: AlimtalkButton;
  title?: string;
};

export type ReserveNcpAlimtalkOptions = {
  templateCode: string;
  to: string;
  content: string;
  reserveTime: string;
  button: AlimtalkButton;
  title?: string;
};

export type AlimtalkButton = {
  type: string;
  name: string;
  schemeIos: string;
  schemeAndroid: string;
};

export type CancelReserveNcpAlimtalkOptions = {
  requestId: string;
};
