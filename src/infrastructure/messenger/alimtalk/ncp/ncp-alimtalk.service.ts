import { Injectable } from '@nestjs/common';
import {
  CancelReserveNcpAlimtalkOptions,
  NcpAlimtalkOptions,
  ReserveNcpAlimtalkOptions,
  SendNcpAlimtalkOptions,
} from './ncp-alimtalk.type';
import { getHeaders } from '../../utill';
import { REST_METHOD, HttpRestMethod } from '../../utill/types';

@Injectable()
export class NcpAlimtalkService {
  private readonly baseUrl = 'https://sens.apigw.ntruss.com';
  private readonly serviceId: string;
  private readonly plusFriendId: string;
  private readonly accessKey: string;
  private readonly secretKey: string;

  constructor(options: NcpAlimtalkOptions) {
    this.accessKey = options.accessKey;
    this.plusFriendId = options.plusFriendId;
    this.serviceId = options.serviceId;
    this.secretKey = options.secretKey;
  }

  async sendAlimtalk(options: SendNcpAlimtalkOptions) {
    const body = {
      plusFriendId: this.plusFriendId,
      templateCode: options.templateCode,
      messages: [
        {
          to: options.to,
          content: options.content,
          title: options.title,
          buttons: [options.button],
        },
      ],
    };
    const endpoint = `/alimtalk/v2/services/${this.serviceId}/messages`;
    const response = await this.requestToNcp(REST_METHOD.POST, endpoint, body);
    console.log(response);
    console.log(response.status);
    console.log(response.statusText);

    return await this.createResponse(response);
  }
  /**
   * 180일까지 예약가능
   * @param options
   * @returns
   */
  async reserveAlimtalk(options: ReserveNcpAlimtalkOptions) {
    const reserveTime = this.createReserveTime(options.reserveTime);
    const body = {
      plusFriendId: this.plusFriendId,
      templateCode: options.templateCode,
      messages: [
        {
          to: options.to,
          content: options.content,
          title: options.title,
          buttons: [options.button],
        },
      ],
      reserveTime: reserveTime,
    };

    const endpoint = `/alimtalk/v2/services/${this.serviceId}/messages`;
    const response = await this.requestToNcp(REST_METHOD.POST, endpoint, body);

    return await this.createResponse(response);
  }

  /**
   * 예약 발송까지 10분이상 남아야함
   * @param options
   * @returns
   */
  async cancelReserveAlimtalk(options: CancelReserveNcpAlimtalkOptions) {
    const endpoint = `/alimtalk/v2/services/${this.serviceId}/reservations/${options.requestId}`;
    const response = await this.requestToNcp(REST_METHOD.DELETE, endpoint);
    console.log(response.statusText);
    if (response.statusText !== 'No Content') {
      return this.createResponse(response);
    }
    return {
      statusCode: null,
      statusText: response.statusText,
      data: 'cancel success',
    };
  }

  private async requestToNcp(
    method: HttpRestMethod,
    endpoint: string,
    body?: Record<string, any>,
  ) {
    const headers = getHeaders(
      method,
      endpoint,
      this.accessKey,
      this.secretKey,
    );

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return response;
  }

  private async createResponse(response: Record<string, any>) {
    const statusText = response.statusText;
    const data = await response.json();
    return { statusCode: data.statusCode, statusText, data };
  }

  private createReserveTime(isoString: string) {
    // 'YYYY-MM-DDTHH:mm:ss.sssZ' 형식에서 'YYYY-MM-DD'와 'HH:mm' 부분을 추출하여 공백으로 연결합니다.
    return isoString.slice(0, 10) + ' ' + isoString.slice(11, 16);
  }
}
