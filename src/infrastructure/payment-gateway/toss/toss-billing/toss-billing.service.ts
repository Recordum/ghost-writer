import { Injectable } from '@nestjs/common';
import {
  TossBillingOptions,
  TossCancelPaymentOption,
  TossCreateBillingKeyOption,
  TossExecutePaymentOption,
} from './toss-billing.type';
import { encodeBase64 } from 'src/utils';

@Injectable()
export class TossBillingService {
  private readonly clientKey: string;
  private readonly secretKey: string;
  private readonly encodedSecretKey: string;
  constructor(options: TossBillingOptions) {
    this.clientKey = options.clientKey;
    this.secretKey = options.secretKey;
    this.encodedSecretKey = this.encodeSecretKey();
  }

  public async requestCreateBillingKey(options: TossCreateBillingKeyOption) {
    const { customerKey, authKey } = options;
    const apiUrl =
      'https://api.tosspayments.com/v1/billing/authorizations/issue';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.encodedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerKey,
        authKey,
      }),
    });
    return await response.json();
  }

  public async requestExecutePayment(options: TossExecutePaymentOption) {
    const {
      billingKey,
      amount,
      customerKey,
      orderId,
      orderName,
      customerName,
      customerEmail,
    } = options;

    const apiUrl = `https://api.tosspayments.com/v1/billing/${billingKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.encodedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        orderId,
        orderName,
        customerKey,
        customerName,
        customerEmail,
      }),
    });

    const statusCode = response.status;
    const statusText = response.statusText;
    const data = await response.json();
    return { statusCode, statusText, data };
  }

  public async requestRefund(options: TossCancelPaymentOption) {
    const { paymentKey, cancelReason, amount } = options;
    const apiUrl = `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.encodedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelReason,
        cancelAmount: amount,
      }),
    });

    const statusCode = response.status;
    const statusText = response.statusText;
    const data = await response.json();
    return { statusCode, statusText, data };
  }

  private encodeSecretKey() {
    const colon = ':';
    return encodeBase64(`${this.secretKey}${colon}`);
  }
}
