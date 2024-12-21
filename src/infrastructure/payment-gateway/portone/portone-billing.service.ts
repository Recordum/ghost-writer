import { Injectable } from '@nestjs/common';
import {
  API_BASE_URL,
  ChannelKeyOption,
  PortoneBillingKeyOption,
  PortoneBillingOption,
  PortoneCancelBillingOption,
  PortoneGetBillingKeyOption,
  PortonePaymentBillingOption,
} from './portone-billig.types';

/**
 * 포트원 빌링 결제(비인증 결제) 구현
 *
 * =========구현 기능=========
 * 1. 빌링키 발급
 *  -> PG사 결제 창을 사용하지 않고, 직접 API를 이용해 빌링키를 발급받는 기능입니다.
 * 2. 빌링키 결제
 * 3. 빌링키 결제 취소
 * 4. 빌링키 조회
 * -> 빌링키를 사용해 등록한 결제수단을 조회할 수있습니다.
 *
 * =====channelKeyMap=======
 * 추후 다양한 pg사에 해당하는 channelKey를 받을수 있도록
 * ChannelKeyMap에 key값을 pg사 value에 channelKey 저장
 * 현재는 Nice Pay 만을 고려함
 *
 * + response 가 200 이 아니면 response.type 에 message 가 있음.
 */
@Injectable()
export class PortoneBillingService {
  private readonly apiSecret: string;
  private readonly channelKeyMap: Map<string, string>;
  private readonly storeId: string;
  private readonly apiUrl: string;
  constructor(options: PortoneBillingOption) {
    this.apiSecret = options.apiSecret;
    this.channelKeyMap = this.setChannelKeyMap(options.channelKeyOptions);
    this.storeId = options.storeId;
    this.apiUrl = API_BASE_URL;
  }

  async requestCreateBillingKey(options: PortoneBillingKeyOption) {
    const {
      pg,
      customerId,
      number,
      expiryYear,
      expiryMonth,
      birthOrBusinessRegistrationNumber,
      passwordTwoDigits,
    } = options;

    const accessToken = await this.getToken();
    const channelKey = this.channelKeyMap.get(pg);
    const response = await fetch(`${this.apiUrl}/billing-keys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelKey,
        customer: {
          id: customerId,
        },
        method: {
          card: {
            credential: {
              number,
              expiryMonth,
              expiryYear,
              birthOrBusinessRegistrationNumber,
              passwordTwoDigits,
            },
          },
        },
      }),
    });

    const statusCode = response.status;
    const statusText = response.statusText;
    const data = await response.json();
    return { statusCode, statusText, data };
  }

  async requestExecutePayment(options: PortonePaymentBillingOption) {
    const { paymentId, billingKey, orderName, customerId, amount, currency } =
      options;
    const accessToken = await this.getToken();

    const response = await fetch(
      `${this.apiUrl}/payments/${paymentId}/billing-key`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingKey,
          orderName,
          customer: {
            id: customerId,
          },
          amount: {
            total: amount,
          },
          currency,
        }),
      },
    );

    const statusCode = response.status;
    const statusText = response.statusText;
    const data = await response.json();
    return { statusCode, statusText, data };
  }

  async requestCancelPayment(options: PortoneCancelBillingOption) {
    const { paymentId, amount, reason } = options;
    const accessToken = await this.getToken();
    const response = await fetch(
      `${this.apiUrl}/payments/${options.paymentId}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount,
          reason,
        }),
      },
    );

    const statusCode = response.status;
    const statusText = response.statusText;
    const data = await response.json();

    if (statusCode >= 400 && statusCode < 501) {
      const error = { type: data.type, pgMessage: data.message };
      return { statusCode, statusText, data: error };
    }
    return { statusCode, statusText, data };
  }

  //billing-key-018da68e-e2b9-bade-2a50-5b211a007635
  async requestGetBillingKey(options: PortoneGetBillingKeyOption) {
    const accessToken = await this.getToken();
    const response = await fetch(
      `${this.apiUrl}/billing-keys/${options.billingKey}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const statusCode = response.status;
    const statusText = response.statusText;
    const data = await response.json();
    return { statusCode, statusText, data };
  }

  private async getToken(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/login/api-secret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiSecret: this.apiSecret,
      }),
    });

    const { accessToken } = await response.json();
    return accessToken;
  }

  private setChannelKeyMap(
    channelKeyOptions: ChannelKeyOption[],
  ): Map<string, string> {
    return channelKeyOptions.reduce(
      (acc, option) => acc.set(option.pg, option.channelKey),
      new Map(),
    );
  }
}
