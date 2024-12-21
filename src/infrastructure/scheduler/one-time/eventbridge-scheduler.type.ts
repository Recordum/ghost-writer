export type EventBridgeSchedulerOption = {
  queueArn: string;
  roleArn: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  region: string;
  groupName?: string; // 없으면 기본으로 만들어지는 default로 설정되도록
};

export type OneTimeSchedulerInput = {
  name: string;
  description?: string;
  scheduleTime: ScheduleTime;
  message: object; // non-nuallble any
};

export type SingleDigitString =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';
export type TwoDigitString = `${SingleDigitString}${SingleDigitString}`;
export type FourDigitString = `${TwoDigitString}${TwoDigitString}`;
export type MinuteAfter = NumericString;
export type ScheduleTime = SpecificTime | MinuteAfter;
export type SpecificTime = {
  year: FourDigitString;
  month: TwoDigitString;
  day: TwoDigitString;
  hour: TwoDigitString;
  minute: TwoDigitString;
};
// 함수 오버로딩을 이용한다.

export type NumericString = `${number}`;
