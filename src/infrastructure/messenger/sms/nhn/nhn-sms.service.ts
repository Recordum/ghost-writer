import { Injectable } from '@nestjs/common';
import {
  NhnSmsOptions,
  SendMessageOptions,
  NhnRestMethod,
  NhnSmsType,
  NHN_REST_METHOD,
  SendReserveMessageOptions,
} from './nhn-sms.type';
import { validatePhoneNumber, validateReserveDate } from './nhn-sms.validator';
import pRetry from 'p-retry';
import { update } from 'lodash';

@Injectable()
export class NhnSmsService {
  private readonly baseUrl = 'https://api-sms.cloud.toast.com';
  private readonly appKey: string;
  private readonly secretKey: string;
  private readonly defaultSendNumber: string | null;
  private readonly blockCallNumber: string;
  private readonly retryCount: number = 3;

  constructor(options: NhnSmsOptions) {
    this.appKey = options.appKey;
    this.secretKey = options.secretKey;
    this.defaultSendNumber = options.defaultSendNumber;
    this.blockCallNumber = options.blockCallNumber;

    if (!validatePhoneNumber(this.defaultSendNumber)) {
      throw new Error(`발신자 기본 번호의 형식이 틀렸습니다.`);
    }

    if (!validatePhoneNumber(this.blockCallNumber)) {
      throw new Error(`수신 거부 번호의 형식이 틀렸습니다.`);
    }
  }

  public async sendMessage(options: SendMessageOptions) {
    const body = this.createRequestBody({
      isAdvertising: options.isAdvertising,
      isReserving: false,
      subject: options.subject,
      content: options.content,
      receivingNumber: options.receivingNumber,
      sendingNumber: options.sendingNumber
        ? options.sendingNumber
        : this.defaultSendNumber,
    });

    const url = options.isAdvertising
      ? this.getResquestUrl('AD-MMS')
      : this.getResquestUrl('MMS');

    return await this.requestToNhn(NHN_REST_METHOD.POST, url, body);
  }

  public async getMessageStatus(requestId: string) {
    let endPoint = this.getResquestUrl('MMS');
    endPoint += `/${requestId}?recipientSeq=1`;

    return await this.requestToNhn(NHN_REST_METHOD.GET, endPoint);
  }

  public async reserveMessage(options: SendReserveMessageOptions) {
    const body = this.createRequestBody({
      isAdvertising: options.isAdvertising,
      isReserving: true,
      reserveTime: options.reserveTime,
      subject: options.subject,
      content: options.content,
      receivingNumber: options.receivingNumber,
      sendingNumber: options.sendingNumber
        ? options.sendingNumber
        : this.defaultSendNumber,
    });

    const url = options.isAdvertising
      ? this.getResquestUrl('AD-MMS')
      : this.getResquestUrl('MMS');

    return await this.requestToNhn(NHN_REST_METHOD.POST, url, body);
  }

  public async cancelReserve(requestId: string) {
    const body = {
      reservationList: [
        {
          requestId,
          recipientSeq: 1,
        },
      ],
      updateUser: 'system',
    };

    console.log(body);

    const url = `${this.baseUrl}/sms/v3.0/appKeys/${this.appKey}/reservations/cancel`;
    const response = await this.requestToNhn(NHN_REST_METHOD.PUT, url, body);
    return response;
  }

  /******************************/
  /* belows are private methods */
  /******************************/
  private async requestToNhn(method: NhnRestMethod, url: string, body?: any) {
    const headers = this.getHeaders();

    const run = async () => {
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      });

      const responseJson = (await response.json()) as {
        header: {
          isSuccessful: boolean;
          resultCode: number;
          resultMessage: string;
        };
      } & any;

      if (responseJson.header.resultCode === '') {
        throw new Error(``);
      }

      if (responseJson.statusCode === '') {
        throw new Error(``);
      }

      return await responseJson;
    };
    return await pRetry(run, { retries: this.retryCount });
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Secret-Key': this.secretKey,
    };
  }

  private getResquestUrl(smsType: NhnSmsType) {
    const endPoints = {
      MMS: `${this.baseUrl}/sms/v3.0/appKeys/${this.appKey}/sender/mms`,
      'AD-MMS': `${this.baseUrl}/sms/v3.0/appKeys/${this.appKey}/sender/ad-mms`,
    };

    return endPoints[smsType];
  }

  // private getReserveRequestUrl(smsType: NhnSmsType) {
  //   const endPoints = {
  //     MMS: `${this.baseUrl}/sms/v3.0/appKeys/${this.appKey}/reservations/cancel/mms`,
  //     'AD-MMS': `${this.baseUrl}/sms/v3.0/appKeys/${this.appKey}/reservations/cancel/ad-mms`,
  //   };
  //   return endPoints[smsType];
  // }

  private transformToAdMessage(content: string) {
    return `(광고) ${content}\n무료수신거부: ${this.blockCallNumber}`;
  }

  // 단건 문자만을 보낸다고 상정하고 구현
  private createRequestBody(options: {
    subject: string;
    content: string;
    sendingNumber: string;
    receivingNumber: string;
    isAdvertising: boolean;
    isReserving: boolean;
    reserveTime?: string;
  }) {
    const {
      subject,
      content,
      sendingNumber,
      receivingNumber,
      isReserving,
      reserveTime,
      isAdvertising,
    } = options;

    if (isReserving && !reserveTime && !validateReserveDate(reserveTime)) {
      throw new Error(
        '[NHN] 예약문자 시간 설정을 안했거나, 시간 양식이 틀렸습니다.',
      );
    }

    if (!validatePhoneNumber(sendingNumber)) {
      throw new Error(`[NHN] 발신자 번호 형식이 틀렸습니다.`);
    }

    if (!validatePhoneNumber(receivingNumber)) {
      throw new Error(`[NHN] 수신자 번호 형식이 틀렸습니다.`);
    }

    const requestBody = Object.freeze({
      title: subject,
      body: isAdvertising ? this.transformToAdMessage(content) : content,
      sendNo: sendingNumber,
      requestDate: isReserving ? reserveTime : '',
      recipientList: [
        {
          recipientNo: receivingNumber,
        },
      ],
    });

    return requestBody;
  }
}
