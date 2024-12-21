import { Injectable } from '@nestjs/common';
import { HttpRestMethod, REST_METHOD } from '../../utill/types';
import {
  CancelReserveNhnAlimTalkOptions,
  NhnAlimtalkOptions,
  ReserveNhnAlimTalkOptions,
  SendNhnAlimtalkOptions,
} from './nhn-alimtalk.type';
import { template } from 'lodash';
/**
 * nhn 알림톡 발송 API
 * 예약 기능 -> 최대 30일
 * 발송 기능
 * 취소 기능
 * 추후 ncp 알림톡 서비스와 Response body 및 status code를 통일?
 * 최소한 error 코드에 대한 문서화는 진행해야함
 */
@Injectable()
export class NhnAlimtalkService {
  private readonly baseUrl = 'https://api-alimtalk.cloud.toast.com';
  private readonly senderKey: string; //발신키
  private readonly secretKey: string;
  private readonly appKey: string;

  constructor(options: NhnAlimtalkOptions) {
    this.senderKey = options.senderKey;
    this.secretKey = options.secretKey;
    this.appKey = options.appKey;
  }

  async sendAlimTalk({ templateCode, recipientList }: SendNhnAlimtalkOptions) {
    const body = {
      senderKey: this.senderKey,
      templateCode,
      recipientList,
    };

    const endpoint = `/alimtalk/v2.3/appkeys/${this.appKey}/raw-messages`;
    const response = await this.requestToNhnAlimTalk(
      REST_METHOD.POST,
      endpoint,
      body,
    );
    return response;
  }

  async reserveAlimTalk({
    templateCode,
    recipientList,
    reserveAt,
  }: ReserveNhnAlimTalkOptions) {
    const body = {
      senderKey: this.senderKey,
      templateCode,
      recipientList,
      requestDate: reserveAt,
    };

    const endpoint = `/alimtalk/v2.3/appkeys/${this.appKey}/raw-messages`;
    const response = await this.requestToNhnAlimTalk(
      REST_METHOD.POST,
      endpoint,
      body,
    );
    return response;
  }

  async cancelReserveAlimTalk(options: CancelReserveNhnAlimTalkOptions) {
    const { requestId } = options;
    const endpoint = `/alimtalk/v2.3/appkeys/${this.appKey}/messages/${requestId}`;
    const response = await this.requestToNhnAlimTalk(
      REST_METHOD.DELETE,
      endpoint,
    );
    return response;
  }

  private async requestToNhnAlimTalk(
    method: HttpRestMethod,
    endpoint: string,
    body?: any,
  ) {
    const headers = this.getHeaders();
    const url = this.baseUrl + endpoint;
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Secret-Key': this.secretKey,
    };
  }
}
