import { Injectable } from '@nestjs/common';
import { OneSignalOptions } from './one-signal.types';

@Injectable()
export class OneSignalService {
  private readonly API_URL = 'https://onesignal.com/api/v1/notifications';
  private readonly appId: string;
  private readonly apiKey: string;
  constructor(options: OneSignalOptions) {
    this.appId = options.appId;
    this.apiKey = options.apiKey;
  }

  async sendNotification(
    headings: string,
    contents: string,
    externalId: string,
    customData?: Record<string, any>,
  ) {
    const body = {
      app_id: this.appId,
      headings: { en: headings },
      contents: {
        en: contents,
      },
      include_aliases: { external_id: [externalId] },
      target_channel: 'push',
    };

    if (customData) {
      body['data'] = customData;
    }

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.apiKey}`,
        accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const statusCode = response.status;
    const statusText = response.statusText;
    const data = await response.json();
    return { statusCode, statusText, data };
  }

  async reserveNotification(
    headings: string,
    contents: string,
    externalId: string,
    reserveTime: string,
    customData?: Record<string, any>,
  ) {
    const body = {
      app_id: this.appId,
      headings: { en: headings },
      contents: {
        en: contents,
      },
      include_aliases: { external_id: [externalId] },
      target_channel: 'push',
      send_after: reserveTime,
    };

    if (customData) {
      body['data'] = customData;
    }

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.apiKey}`,
        accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const statusCode = response.status;
    const statusText = response.statusText;
    const data = await response.json();
    return { statusCode, statusText, data };
  }

  async cancelReserveNotification(notificationId: string) {
    const response = await fetch(
      `${this.API_URL}/${notificationId}?app_id=${this.appId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.apiKey}`,
          accept: 'application/json',
        },
      },
    );

    const statusCode = response.status;
    const statusText = response.statusText;
    const data = await response.json();
    return { statusCode, statusText, data };
  }

  async view() {
    const response = await fetch(
      `https://api.onesignal.com/apps?app_id=${this.appId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.apiKey}`,
          accept: 'application/json',
        },
      },
    );

    const statusCode = response.status;
    const statusText = response.statusText;
    const data = await response.json();
    return { statusCode, statusText, data };
  }
}
