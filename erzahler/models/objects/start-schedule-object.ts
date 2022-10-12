import { WeeklyScheduleEventObject } from "./weekly-schedule-event-object";

export interface StartScheduleObject {
  userTimeZone: string;
  observeDst: boolean;
  deadlineType: string;
  turn1Timing: string;
  gameStart: Date | string;
  firstTurnDeadline: Date | string;
  orders: WeeklyScheduleEventObject;
  retreats: WeeklyScheduleEventObject;
  adjustments: WeeklyScheduleEventObject;
  nominations: WeeklyScheduleEventObject;
  votes: WeeklyScheduleEventObject;
}