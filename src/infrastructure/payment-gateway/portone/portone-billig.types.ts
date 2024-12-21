export const PG = {
  NICE_PAY: 'nicePay',
} as const;
export type PaymentGateway = (typeof PG)[keyof typeof PG];

export const API_BASE_URL = 'https://api.portone.io';

export type ChannelKeyOption = {
  pg: PaymentGateway;
  channelKey: string;
};

export type PortoneBillingOption = {
  channelKeyOptions: ChannelKeyOption[];
  apiSecret: string;
  storeId: string;
};

export interface PortoneBillingAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<PortoneBillingOption> | PortoneBillingOption;
}

export type PortoneBillingKeyOption = {
  pg: PaymentGateway;
  customerId: string;
  number: string;
  expiryYear: string;
  expiryMonth: string;
  birthOrBusinessRegistrationNumber: string;
  passwordTwoDigits: string;
};

export type PortonePaymentBillingOption = {
  paymentId: string;
  billingKey: string;
  orderName: string;
  customerId: string;
  amount: number;
  currency: string;
};

export type PortoneCancelBillingOption = {
  paymentId: string;
  amount: number;
  reason: string;
};

export type PortoneGetBillingKeyOption = {
  billingKey: string;
};
