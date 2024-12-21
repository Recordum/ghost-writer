import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import {
  NCP_REST_METHOD,
  NcpRestMethod,
  NcpSmsOptions,
  SendMessageOptions,
} from './ncp-sms.type';
import { validatePhoneNumber } from './ncp-sms.validator';
import pRetry from 'p-retry';

/**
 * logging은 나중에 고민
 * 사실 이 결과는 Either나 Maybe로 감싸서 반환한 다음에 로깅은 서비스 레이어에서 책임지도록 하는게 좋은 옵션인 것 같긴하다.
 */
@Injectable()
export class NcpSmsService {
  private readonly baseUrl: string = 'https://sens.apigw.ntruss.com';
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly blockCallNumber: string;
  private readonly serviceId: string;
  private readonly defaultSendNumber: string | null;
  private readonly retryCount: number = 3;

  constructor(options: NcpSmsOptions) {
    this.accessKey = options.accessKey;
    this.secretKey = options.secretKey;
    this.blockCallNumber = options.blockCallNumber;
    this.serviceId = options.serviceId;
    this.defaultSendNumber = options.defaultSendNumber;

    if (!validatePhoneNumber(this.blockCallNumber)) {
      throw new Error(
        "blockCallNumber doesn't match the phone number format. Only numbers are allowed.",
      );
    }

    if (!validatePhoneNumber(this.defaultSendNumber)) {
      throw new Error(
        "defaultSendNumber doesn't match the phone number format. Only numbers are allowed.",
      );
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
    const endpoint = `/sms/v2/services/${this.serviceId}/messages`;
    return await this.requestToNcp(NCP_REST_METHOD.POST, endpoint, body);
  }

  public async getMessageStatus(requestId: string) {
    const endpoint = `/sms/v2/services/${this.serviceId}/messages?requestId=${requestId}`;
    return await this.requestToNcp(NCP_REST_METHOD.GET, endpoint);
  }

  public async reserveMessage() {
    return 'reserveAdvertisingMessage';
  }

  public async cancelReserve() {
    return 'cancelReservation';
  }

  /******* Belows are Private Mehtodss **********************************************************************/
  /******************************************************************************************************/

  private async requestToNcp(
    method: NcpRestMethod,
    endpoint: string,
    body?: any,
  ) {
    const headers = this.getHeaders(method, endpoint);
    const url = `${this.baseUrl}${endpoint}`; // url-join 함수 만들어서 사용하기

    const run = async () => {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body),
      });
      const responseJson = (await response.json()) as {
        statusCode: number;
      } & any;

      if (responseJson.statusCode === '429') {
        throw new Error(
          'Naver Sens API Status Code is 429. Too Many Requests.',
        );
      }

      if (responseJson.statusCode === '500') {
        throw new Error('Naver Sens API Status Code is 500. Internal Error.');
      }
      return responseJson;
    };

    return await pRetry(run, { retries: this.retryCount });
  }

  private getSignature(
    method: NcpRestMethod,
    url: string,
    unixTimeStamp: string,
  ) {
    const space = ' '; // one space
    const newLine = '\n'; // new line
    const timestamp = unixTimeStamp;

    const hmac = CryptoJS.algo.HMAC.create(
      CryptoJS.algo.SHA256,
      this.secretKey,
    );
    hmac.update(method);
    hmac.update(space);
    hmac.update(url);
    hmac.update(newLine);
    hmac.update(timestamp);
    hmac.update(newLine);
    hmac.update(this.accessKey);

    const hash = hmac.finalize();
    return hash.toString(CryptoJS.enc.Base64);
  }

  private getHeaders(method: NcpRestMethod, endpoint: string) {
    const unixTimeStamp = this.getUnixTimeStamp();
    return {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-apigw-timestamp': unixTimeStamp,
      'x-ncp-iam-access-key': this.accessKey,
      'x-ncp-apigw-signature-v2': this.getSignature(
        method,
        endpoint,
        unixTimeStamp,
      ),
    };
  }

  // NCP에서는 epoch timestamp를 사용한다. (unix timestamp와 동일) - time과 관련되어 있어서 module내의 util로 빼는게 좋을 수 있지만, 일단 그냥 놔둔다.
  private getUnixTimeStamp() {
    return Date.now().toString();
  }

  private tranformToAdMessage(content: string): string {
    return `(광고) ${content}\n무료수신거부: ${this.blockCallNumber}`;
  }

  private createRequestBody(options: {
    isAdvertising: boolean;
    isReserving: boolean;
    subject: string;
    content: string;
    sendingNumber: string;
    receivingNumber: string;
    reserveTime?: string | null;
  }) {
    const {
      isAdvertising,
      isReserving,
      subject,
      content,
      sendingNumber,
      receivingNumber,
      reserveTime,
    } = options;
    if (isReserving && !reserveTime) {
      throw new Error(
        '예약 문자를 보낼 때는 예약 시간과 타임존을 설정해야 합니다.',
      );
    }
    /**
     *  TODO
     *    1. 휴대폰 번호 유효성 검사
     *    2. reserveTime 유효성 검사
     */

    if (!validatePhoneNumber(sendingNumber)) {
      throw new Error(
        "sendingNumber doesn't match the phone number format. Only numbers are allowed.",
      );
    }

    if (!validatePhoneNumber(receivingNumber)) {
      throw new Error(
        "receivingNumber doesn't match the phone number format. Only numbers are allowed.",
      );
    }

    return Object.freeze({
      type: 'LMS',
      contentType: isAdvertising ? 'AD' : 'COMM',
      countryCode: '82',
      from: sendingNumber,
      subject: subject,
      content: isAdvertising ? this.tranformToAdMessage(content) : content,
      messages: [
        {
          to: receivingNumber,
          subject: subject,
          content: isAdvertising ? this.tranformToAdMessage(content) : content,
        },
      ],
      files: undefined,
      reserveTime: reserveTime,
      reserveTimeZone: isReserving ? 'Asia/Seoul' : undefined,
      scheduleCode: undefined,
    });
  }
}

// 문자는 항상 광고문자와 그렇지 않은 문자로 나뉜다.
// Naver Sens 문서 가이드 라인 (https://api.ncloud-docs.com/docs/ai-application-service-sens-smsv2)
