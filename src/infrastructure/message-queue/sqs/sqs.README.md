# 설명

이전에 teamsparta nestjs sqs 패키지를 그대로 옮겨 온것. discovery service + nest 버전 문제로 잘 동작하지 않았던 이슈로 옮겨둠.

아래는 이전에 작성했던, README

# 1) 모듈 임포트

```typescript
AWS.config.update({
  accessKeyId: 'x',
  secretAccessKey: 'x',
  region: 'x',
});

@Module({
  imports: [
    SqsModule.registerAsync({
      useFactory: () => {
        return {
          consumers: [
            {
              name: '큐이름',
              queueUrl: '큐 url',
              secretAccessKey: 'secretKey',
              accessKeyId: 'accessKeyId',
              region: 'region',
            },
          ],
          producers: [
            {
              name: '큐이름',
              queueUrl: '큐 url',
              secretAccessKey: 'secretKey',
              accessKeyId: 'accessKeyId',
              region: 'region',
            },
          ],
        };
      },
    }),
  ],
})
export class {}
```

# 2) Producer - 메시지 생성

- sqsService를 주입하고 send로 메시지를 보냄
- 보낼 때 routing 규칙을 지키도록

**(아래) producer 중요 인터페이스 살펴보기**

```typescript
class SqsService implements OnModuleInit, OnModuleDestroy {
    send<T = any>(sqsRouteOptions: SqsRouteOptions, payload: Message<T> | Message<T>[]): Promise<AWS.SQS.SendMessageBatchResultEntryList>;
}

=> 쉽게 send(SqsRouteOptions, Message)

interface SqsRouteOption{
    queue: string;
    controller: string;
    handler: string;
}

interface Message<T = any> {
    id: string;
    body: T;
    groupId?: string;
    deduplicationId?: string;
    delaySeconds?: number;
    messageAttributes?: SQS.MessageBodyAttributeMap;
}
```

(아래) 메시지 보내는 서비스 만든 예시

```typescript
import { SqsService } from '@teamsparta/nest-js-sqs';

@Injectable()
export class AppService {
  // sqsService 주입
  constructor(private readonly sqsService: SqsService) {}

  async sendMessage(routeOptions: SqsRouteOptions, message: any) {
    const date = (+new Date()).toString();
    return new Promise<boolean>((resolve, reject) => {
      // 보냄
      this.sqsService
        .send(routeOptions, {
          id: date,
          body: message.body, //
          groupId: message.groupId ? message.groupId : null, // FIFO
          deduplicationId: message.deduplicationId // FIFO -> 메시지 중복 방지
            ? message.deduplicationId
            : null, // FIFO : deduplicationId가 중복되면 메시지는 가지 않게 된다.
        })
        .then((result) => {
          resolve(true);
        })
        .catch((err) => reject(err));
    });
  }
}
```

# 3) Consumer - Decorator를 활용한 Routing

데코레이터를 활용함

```typescript
import { SqsHandler, SqsController } from '@teamsparta/nest-js-sqs';

@SqsController('큐 이름', 'Controller 이름(prefix)') // class에 붙는 데코레이터
@Injectable()
export class Sqs_QueueName_ControllerName {
  @SqsHandler('eventName')
  async sendAlimtalk(parameter) {
    // 구현,
    // 개선해야할 점 : Parameter를 진짜 Parameter만 받을 수 있게 하기
  }
}
```

이름을 어떻게 짓던 상관없고 파일을 하나 만듦.
