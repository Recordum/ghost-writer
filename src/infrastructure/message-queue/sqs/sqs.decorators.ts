import { SetMetadata } from '@nestjs/common';
import {
  SQS_CONSUMER_CONTROLLER,
  SQS_CONSUMER_CONTROLLER_METHOD,
} from './sqs.constants';

export const SqsController = (queueName: string, prefix: string) =>
  SetMetadata(SQS_CONSUMER_CONTROLLER, { queueName, prefix });
export const SqsHandler = (eventName: string) =>
  SetMetadata(SQS_CONSUMER_CONTROLLER_METHOD, { eventName });
