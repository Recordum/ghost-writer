import {
  CreateScheduleCommand,
  CreateScheduleInput,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';
import { Injectable } from '@nestjs/common';
import {
  OneTimeSchedulerInput,
  ScheduleTime,
} from './eventbridge-scheduler.type';
import { DateTime } from 'luxon';

@Injectable()
export class EventBridgeSchedulerService {
  private readonly client: SchedulerClient;
  private readonly queueArn: string;
  private readonly roleArn: string;
  private readonly groupName: string;

  constructor(
    queueArn: string,
    roleArn: string,
    groupName: string,
    accessKeyId: string,
    secretKey: string,
    region: string,
  ) {
    this.queueArn = queueArn;
    this.roleArn = roleArn;
    this.groupName = groupName;
    this.client = new SchedulerClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey: secretKey,
      },
    });
  }

  public async createOneTimeScheduler(param: OneTimeSchedulerInput) {
    const { name, scheduleTime, message, description } = param;

    const scheduleExpression = this.scheduleExpression(scheduleTime);
    const input: CreateScheduleInput = {
      Name: name,
      GroupName: this.groupName,
      ScheduleExpression: `at(${scheduleExpression})`, // once time
      Description: description ? description : '',
      ScheduleExpressionTimezone: 'Asia/Seoul',
      State: 'ENABLED',
      Target: {
        Arn: this.queueArn,
        RoleArn: this.roleArn,
        Input: JSON.stringify(message),
      },
      FlexibleTimeWindow: {
        Mode: 'OFF',
      },
      ActionAfterCompletion: 'DELETE',
    };
    const command = new CreateScheduleCommand(input);
    const response = await this.client.send(command);
    return response;
  }

  /**
   * 아래 함수 추후 리팩토링 필요
   *
   */
  private scheduleExpression(scheduleTime: ScheduleTime): string {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    let input = '';

    /**
     * ScheduleTime의 type에 따라 시간을 다르게 계산한다.
     *  */
    if (typeof scheduleTime === 'string') {
      const now = DateTime.now().setZone('Asia/Seoul');
      const after = now.plus({ minutes: Number(scheduleTime) });
      const afterISO = after.toISO();
      input = afterISO.split('.')[0];
    } else if (typeof scheduleTime === 'object') {
      const { year, month, day, hour, minute } = scheduleTime;
      const now = DateTime.now().setZone('Asia/Seoul');
      const after = DateTime.fromObject({
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: Number(hour),
        minute: Number(minute),
      }).setZone('Asia/Seoul');
      if (after < now) {
        throw new Error('Invalid Time: Scheduled Time is before now');
      }
      const afterISO = after.toISO();
      input = afterISO.split('.')[0];
    }

    if (!regex.test(input)) {
      throw new Error('Invalid Type');
    }
    return input;
  }
}
