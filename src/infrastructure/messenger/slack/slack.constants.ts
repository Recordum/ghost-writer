import { ConfigMode } from 'src/infrastructure/config/config.service';

export const SLACK_CHANNEL = {
  // 500이상 에러 알림
  ERROR_MONITORING(): string {
    console.log('process.env.ENV', process.env.ENV);
    if (process.env.ENV === ConfigMode.PRODUCTION)
      return 'prod_sever_error_noti';
    // todo : 테스트 채널 추가
    if (process.env.ENV === ConfigMode.TEST) return 'test_sever_error_noti';
    return null;
  },

  // 결제시 알림
  PAYMENT(): string {
    if (process.env.ENV === ConfigMode.PRODUCTION) return 'prod_payment_noti';
    if (process.env.ENV === ConfigMode.TEST) return 'test_payment_noti';
    return null;
  },

  // 스케줄링 관련 알람을 받으며 모두 추적하기 위한 채널
  SCHEDULING(): string {
    if (process.env.ENV === ConfigMode.PRODUCTION)
      return 'prod_scheduling_noti';
    if (process.env.ENV === ConfigMode.TEST) return 'test_scheduling_noti';
    return null;
  },

  // 알림 발송 실패에 대한 노티
  FAIL_NOTI(): string {
    if (process.env.ENV === ConfigMode.PRODUCTION)
      return 'prod_fail_알림발송_noti';
    if (process.env.ENV === ConfigMode.TEST) return 'test_fail_알림발송_noti';
    return null;
  },

  SETTLEMENT(): string {
    if (process.env.ENV === ConfigMode.PRODUCTION)
      return 'prod_settlement_noti';
    if (process.env.ENV === ConfigMode.TEST) return 'test_settlement_noti';
    return null;
  },
} as const;
