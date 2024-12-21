이 모듈은 여러개의 앱을 만들어서,
UserId를 기반으로 App Push 메시지를 보냅니다.

```
@Module({
  imports: [
    OneSignalModule.register('oneSignalConfig1', {
      appId: 'app-id-1',
      apiKey: 'apiKey',
    }),
    OneSignalModule.register('oneSignalConfig2', {
      appId: 'app-id-2',
      apiKey: 'apiKey',
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

```
@Injectable()
export class SomeService {
  constructor(
    @Inject('OneSignalService_oneSignalConfig1') private oneSignalService1: OneSignalService,
    @Inject('OneSignalService_oneSignalConfig2') private oneSignalService2: OneSignalService,
  ) {}

  // Now you can use this.oneSignalService1 and this.oneSignalService2
}
```
