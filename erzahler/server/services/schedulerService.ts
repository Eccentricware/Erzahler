import { StartScheduleObject } from "../../models/start-schedule-object";

export class SchedulerService {
  prepareStartSchedule(settings: any): StartScheduleObject {
    let gameStart = '2022 10 01 01:00:00';
    let firstTurnDeadline = '2022 10 02 02:00:00';
    let ordersDay = 'Monday';
    let ordersTime = '03:00:00';
    let retreatsDay = 'Monday';
    let retreatsTime = '04:00:00';
    let adjustmentsDay = 'Monday';
    let adjustmentsTime = '05:00:00';
    let nominationsDay = 'Monday';
    let nominationsTime = '06:00:00';
    let votesDay = 'Monday';
    let votesTime = '07:00:00';

    const schedule: StartScheduleObject = {
      gameStart: gameStart,
      firstTurnDeadline: firstTurnDeadline,
      ordersDay: ordersDay,
      ordersTime: ordersTime,
      retreatsDay: retreatsDay,
      retreatsTime: retreatsTime,
      adjustmentsDay: adjustmentsDay,
      adjustmentsTime: adjustmentsTime,
      nominationsDay: nominationsDay,
      nominationsTime: nominationsTime,
      votesDay: votesDay,
      votesTime: votesTime
    }

    return schedule;
  }

  localDateToUtcDate(date: Date): Date | string {
    console.log('Receiving Date', date);
    return date;
  }

  timeIdentity(serverTime: Date) {
    return serverTime;
  }
}