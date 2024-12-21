import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Message, QueueName, SqsOptions, SqsRouteOptions } from './sqs.types';
import { Consumer } from 'sqs-consumer';
import { Producer } from 'sqs-producer';
import { SQS_OPTIONS } from './sqs.constants';
// import { QueueAttributeName } from 'aws-sdk/clients/sqs';
import { SqsRouter } from './sqs.router';
import { SQSClient } from '@aws-sdk/client-sqs';
import { DiscoveryService } from 'src/infrastructure/discovery';

@Injectable()
export class SqsService implements OnModuleInit, OnModuleDestroy {
  public readonly consumers = new Map<QueueName, Consumer>();
  public readonly producers = new Map<QueueName, Producer>();
  private readonly logger = new Logger('SqsService', {
    timestamp: false,
  });

  public constructor(
    @Inject(SQS_OPTIONS) public readonly options: SqsOptions,
    private readonly discover: DiscoveryService,
    private readonly router: SqsRouter,
  ) {}

  public async onModuleInit(): Promise<void> {
    this.options.consumers?.forEach((options) => {
      const { name, ...consumerOptions } = options;
      if (this.consumers.has(name)) {
        throw new Error(`Consumer already exits: ${name}`);
      }
      const consumer = Consumer.create({
        queueUrl: consumerOptions.queueUrl,
        handleMessage: async (message: any) => {
          const messageBody = JSON.parse(message.Body);
          const { queue, controller, handler, ...args } = messageBody;
          if (!queue || !controller || !handler) {
            this.logger.warn(
              'Routing 규칙이 맞지 않습니다.. message를 발행할 때 queue, controller, handler모두 필요합니다.',
            );
            return;
          }
          const sqsRouteOptions: SqsRouteOptions = {
            queue,
            controller,
            handler,
          };
          if (consumer.isRunning) {
            return await this.router.route(sqsRouteOptions, args);
          }
          throw new Error('Consumer is not running');
        },
        sqs: new SQSClient({
          region: consumerOptions.region,
          credentials: {
            accessKeyId: consumerOptions.accessKeyId,
            secretAccessKey: consumerOptions.secretAccessKey,
          },
        }),
      });
      this.consumers.set(name, consumer);
    });

    this.options.producers?.forEach((options) => {
      const { name, ...producerOptions } = options;
      if (this.producers.has(name)) {
        throw new Error(`Producer already exists: ${name}`);
      }
      const producer = Producer.create(producerOptions);
      this.producers.set(name, producer);
    });

    for (const consumer of this.consumers.values()) {
      consumer.start();
    }
  }

  public onModuleDestroy() {
    for (const consumer of this.consumers.values()) {
      consumer.stop();
    }
  }

  private getQueueInfo(name: QueueName) {
    if (!this.consumers.has(name) && !this.producers.has(name)) {
      throw new Error(`Consumer/Producer does not exist: ${name}`);
    }

    const { sqs, queueUrl } = (this.consumers.get(name) ??
      //   this.producers.get(name)) as { sqs: AWS.SQS; queueUrl: string };
      this.producers.get(name)) as { sqs: any; queueUrl: string };

    if (!sqs) {
      throw new Error('SQS instance does not exist');
    }

    return {
      sqs,
      queueUrl,
    };
  }

  public async purgeQueue(name: QueueName) {
    const { sqs, queueUrl } = this.getQueueInfo(name);
    return sqs.purgeQueue({ QueueUrl: queueUrl }).promise();
  }

  //   public async getQueueAttributes(name: QueueName) {
  //     const { sqs, queueUrl } = this.getQueueInfo(name);
  //     const response = await sqs
  //       .getQueueAttributes({
  //         QueueUrl: queueUrl,
  //         AttributeNames: ['All'],
  //       })
  //       .promise();
  //     return response.Attributes as { [key in QueueAttributeName]: string };
  //   }

  public getProducerQueueSize(name: QueueName) {
    if (!this.producers.has(name)) {
      throw new Error(`Producer does not exist : ${name}`);
    }
    return this.producers.get(name).queueSize();
  }

  public send<T = any>(
    sqsRouteOptions: SqsRouteOptions,
    payload: Message<T> | Message<T>[],
  ) {
    if (!this.producers.has(sqsRouteOptions.queue)) {
      throw new Error(`Producer does not exist: ${sqsRouteOptions.queue}`);
    }
    const originalMessages = Array.isArray(payload) ? payload : [payload];
    const messages = originalMessages.map((message) => {
      let body = message.body;
      if (typeof body !== 'string') {
        Object.assign(body, sqsRouteOptions);
        body = JSON.stringify(body) as any;
      }
      return {
        ...message,
        body,
      };
    });
    const producer = this.producers.get(sqsRouteOptions.queue);
    return producer.send(messages as any[]);
  }
}
