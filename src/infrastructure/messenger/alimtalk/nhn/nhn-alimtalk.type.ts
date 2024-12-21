export type NhnAlimtalkOptions = {
  senderKey: string; //발신자키 sender key
  appKey: string;
  secretKey: string;
};

export type SendNhnAlimtalkOptions = {
  templateCode: string;
  recipientList: [
    {
      recipientNo: string;
      content: string;
      buttons?: [
        {
          ordering: number;
          type: string;
          name: string;
          schemeIos?: string;
          schemeAndroid?: string;
          target?: string;
        },
      ];
    },
  ];
};

export type ReserveNhnAlimTalkOptions = SendNhnAlimtalkOptions & {
  reserveAt: string; //yyyy-MM-dd HH:mm 형식
};

export type CancelReserveNhnAlimTalkOptions = {
  requestId: string;
};

export interface NhnAlimtalkAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<NhnAlimtalkOptions> | NhnAlimtalkOptions;
}
