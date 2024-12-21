import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { SlackOptions } from './types';
import { SLACK_CHANNEL } from 'src/infrastructure/messenger/slack/slack.constants';

@Injectable()
export class SlackService {
  private web: WebClient;
  private webMrD: WebClient;
  private appToken: string;
  private appTokenMrD: string;
  private channel: string;
  constructor(slackOptions: SlackOptions) {
    this.channel = slackOptions.channel;
    this.appToken = slackOptions.appToken;
    this.appTokenMrD = slackOptions.appTokenMrD;
    this.web = new WebClient(this.appToken);
    this.webMrD = new WebClient(this.appTokenMrD);
  }

  async sendMessage(message: string) {
    await this.sendMessageMrDWithChannel(SLACK_CHANNEL.SETTLEMENT(), message);
    return await this.web.chat.postMessage({
      channel: this.channel,
      text: message,
    });
  }

  // 채널을 직접 설정하여 보낼 수 있다.
  async sendMessageWithChannel(channel: string, message: string) {
    return await this.web.chat.postMessage({
      channel: channel,
      text: message,
    });
  }

  async sendMessageMrDWithChannel(channel: string, message: string) {
    return await this.webMrD.chat.postMessage({
      channel: channel,
      text: message,
    });
  }
}
