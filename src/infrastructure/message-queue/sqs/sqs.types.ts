import type { ConsumerOptions } from 'sqs-consumer';
import type { Producer } from 'sqs-producer';
// import type { SQS } from 'aws-sdk';
import type { ModuleMetadata, Type } from '@nestjs/common';

export type ProducerOptions = Parameters<typeof Producer.create>[0];
export type QueueName = string;
export type ControllerName = string;
export type EventName = string;
export type UniqueHandler = [ControllerName, EventName];

export type EventHandler = (
  ...args: any[]
) => Promise<boolean> | boolean | void;

export type SqsConsumerOptions = Omit<
  ConsumerOptions,
  'handleMessage' | 'handleMessageBatch'
> & {
  name: QueueName;
  secretAccessKey: string;
  accessKeyId: string;
  region: string;
};

export type SqsProducerOptions = ProducerOptions & {
  name: QueueName;
  secretAccessKey: string;
  accessKeyId: string;
  region: string;
};

export interface SqsRouteOptions {
  queue: string;
  controller: string;
  handler: string;
}

export interface SqsOptions {
  consumers?: SqsConsumerOptions[];
  producers?: SqsProducerOptions[];
}

export interface SqsModuleOptionsFactory {
  createOptions(): Promise<SqsOptions> | SqsOptions;
}

export interface SqsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<SqsModuleOptionsFactory>;
  useClass?: Type<SqsModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<SqsOptions> | SqsOptions;
  inject?: any[];
}

export interface Message<T = any> {
  id: string;
  body: T;
  groupId?: string;
  deduplicationId?: string;
  delaySeconds?: number;
  //   messageAttributes?: SQS.MessageBodyAttributeMap; // TODO: SQS Import 하지 않도록 변경하기
  messageAttributes?: any;
}

export interface SqsMessageHandlerMeta {
  name: string;
  batch?: boolean;
}

export interface SqsControllerMeta {
  queueName: string;
  prefix: string;
}

export interface SqsHandlerMeta {
  eventName: string;
}

export interface SqsConsumerEventHandlerMeta {
  name: string;
  eventName: string;
}
