export interface StartScheduleObject {
  userTimeZone: string;
  observeDst: boolean;
  deadlineType: string;
  turn1Timing: string;
  gameStart: Date | string;
  firstTurnDeadline: Date | string;
  ordersDay: Date | string;
  ordersTime: Date | string;
  retreatsDay: Date | string;
  retreatsTime: Date | string;
  adjustmentsDay: Date | string;
  adjustmentsTime: Date | string;
  nominationsDay: Date | string;
  nominationsTime: Date | string;
  votesDay: Date | string;
  votesTime: Date | string;
}