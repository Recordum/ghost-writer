import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  EventHandler,
  SqsControllerMeta,
  SqsHandlerMeta,
  SqsRouteOptions,
} from './sqs.types';
// import { DiscoveryService } from '@nestjs-plus/discovery';
import {
  SQS_CONSUMER_CONTROLLER,
  SQS_CONSUMER_CONTROLLER_METHOD,
} from './sqs.constants';
import { DiscoveryService } from 'src/infrastructure/discovery';

@Injectable()
export class SqsRouter implements OnModuleInit, OnModuleDestroy {
  private readonly queueControllerPathSet = new Set<string>();
  private readonly queueControllerHandlerPathSet = new Set<string>();
  private readonly routingContainer = new Map<string, EventHandler>();
  private readonly logger = new Logger('SqsRouter', { timestamp: false });

  public constructor(private readonly discover: DiscoveryService) {
    this.logger.log("In SqsRouter's constructor");
  }

  public async onModuleInit(): Promise<void> {
    const controllers =
      await this.discover.providersWithMetaAtKey<SqsControllerMeta>(
        SQS_CONSUMER_CONTROLLER,
      );

    for (const controller of controllers) {
      const queueName = controller.meta.queueName;
      const controllerPrefix = controller.meta.prefix;
      const queueControllerPath = queueName + '/' + controllerPrefix;

      if (this.queueControllerPathSet.has(queueControllerPath)) {
        throw new Error(
          `In Queue [${queueName}],  There exists redundancy Controller [${controllerPrefix}]`,
        );
      } else {
        this.queueControllerPathSet.add(queueControllerPath);
      }

      const handlers = this.discover.classMethodsWithMetaAtKey<SqsHandlerMeta>(
        controller.discoveredClass,
        SQS_CONSUMER_CONTROLLER_METHOD,
      );

      for (const handler of handlers) {
        const queueControllerHandlerPath =
          queueControllerPath + '/' + handler.meta.eventName;
        if (
          this.queueControllerHandlerPathSet.has(queueControllerHandlerPath)
        ) {
          throw new Error(
            `In Queue [${queueName}] and Controller [${controllerPrefix}],  There exists redundancy Handler [${handler.meta.eventName}]`,
          );
        } else {
          this.queueControllerHandlerPathSet.add(queueControllerHandlerPath);
        }
        this.routingContainer.set(
          queueControllerHandlerPath,
          handler.discoveredMethod.handler.bind(
            handler.discoveredMethod.parentClass.instance,
          ),
        );
        this.routingContainer.forEach((value, key, map) => {
          this.logger.log(`${key} routingPath initialized with ${value}`);
        });
      }
    }
  }

  public async route(routeOptions: SqsRouteOptions, ...args: any[]) {
    const routePath = Object.values(routeOptions).join('/');
    const handler = this.routingContainer.get(routePath);
    await handler(args);
  }
  public onModuleDestroy() {
    this.logger.log('In SqsRouter onModuleDestroy');
  }
}
