export interface StartScheduleEvents {
  userTimeZone: string;
  observeDst: boolean;
  deadlineType: string;
  turn1Timing: string;
  gameStart: string | Date;
  firstTurnDeadline: string | Date;
  ordersDay: string;
  ordersTime: string;
  retreatsDay: string;
  retreatsTime: string;
  adjustmentsDay: string;
  adjustmentsTime: string;
  nominationsDay: string;
  nominationsTime: string;
  votesDay: string;
  votesTime: string;
}