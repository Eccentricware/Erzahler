import { DateTime } from "luxon";

export interface StartScheduleEvents {
  userTimeZone: string;
  observeDst: boolean;
  deadlineType: string;
  turn1Timing: string;
  gameStart: string;
  firstTurnDeadline: string;
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

export interface ScheduledJob {
  name: string;
  date: any;
  isOneTimeJob: boolean;
}