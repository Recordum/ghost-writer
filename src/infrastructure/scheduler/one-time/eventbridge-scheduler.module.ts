import { Module } from '@nestjs/common';
import { EventBridgeSchedulerOption } from './eventbridge-scheduler.type';
import { EventBridgeSchedulerService } from './eventbridge-scheduler.service';

/** EventBridge를 Scheduler로 할 수 있는 일은 너무 많지만, 일단, SQS만 붙여둘 수 있도록 구조를 설계하고 그 후에 계속해서 개선해나가도록 하자. */
@Module({})
export class EventBridgeSchedulerModule {
  static register(option: EventBridgeSchedulerOption) {
    return {
      global: true,
      module: EventBridgeSchedulerModule,
      providers: [
        {
          provide: EventBridgeSchedulerService,
          useValue: new EventBridgeSchedulerService(
            option.queueArn,
            option.roleArn,
            option.groupName ? option.groupName : 'default',
            option.credentials.accessKeyId,
            option.credentials.secretAccessKey,
            option.region,
          ),
        },
      ],
      exports: [EventBridgeSchedulerService],
    };
  }
}
