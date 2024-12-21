export type TossBillingOptions = {
  clientKey: string;
  secretKey: string;
};

export type TossCreateBillingKeyOption = {
  customerKey: string;
  authKey: string;
};

export type TossExecutePaymentOption = {
  customerKey: string;
  amount: number;
  billingKey: string;
  orderId?: string;
  orderName?: string;
  customerName?: string;
  customerEmail?: string;
};

export type TossCancelPaymentOption = {
  paymentKey: string;
  cancelReason: string;
  amount: number;
};
