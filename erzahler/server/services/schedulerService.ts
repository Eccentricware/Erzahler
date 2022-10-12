import { getTimeZones, TimeZone } from '@vvo/tzdb';
import { StartScheduleObject } from "../../models/objects/start-schedule-object";
import { WeeklyScheduleEventObject } from "../../models/objects/weekly-schedule-event-object";
import { DateTime } from 'luxon';

export class SchedulerService {
  timeZones: TimeZone[];
  turnOrder: string[] = [
    'orders',
    'retreats',
    'adjustments',
    'nominations',
    'votes'
  ];
  days: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  dayValues: any = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  constructor() {
    this.timeZones = getTimeZones();
  }

  // Helpful for debugging by removing all extraneous variables
  extractEvents(settings: any) {
    return {
      userTimeZone: settings.timeZone,
      observeDst: settings.observeDst,
      deadlineType: settings.deadlineType,
      turn1Timing: settings.turn1Timing,
      gameStart: settings.gameStart,
      firstTurnDeadline: settings.firstTurnDeadline,
      ordersDay: settings.ordersDay,
      ordersTime: settings.ordersTime,
      retreatsDay: settings.retreatsDay,
      retreatsTime: settings.retreatsTime,
      adjustmentsDay: settings.adjustmentsDay,
      adjustmentsTime: settings.adjustmentsTime,
      nominationsDay: settings.nominationsDay,
      nominationsTime: settings.nominationsTime,
      votesDay: settings.votesDay,
      votesTime: settings.votesTime
    }
  }

  prepareStartSchedule(events: any): StartScheduleObject {
    console.log('gameStart', events.gameStart);
    console.log('firstTurnDeadline is a', typeof events.firstTurnDeadline);
    console.log('Settings in prepareStartSchedule:', events);
    const schedule: StartScheduleObject = {
      userTimeZone: events.userTimeZone,
      observeDst: events.observeDst,
      deadlineType: events.deadlineType,
      turn1Timing: events.turn1Timing,
      gameStart: events.gameStart,
      firstTurnDeadline: events.firstTurnDeadline,
      orders: this.resolveScheduledEvent(events.ordersDay, events.ordersTime, events.userTimeZone),
      retreats: this.resolveScheduledEvent(events.retreatsDay, events.retreatsTime, events.userTimeZone),
      adjustments: this.resolveScheduledEvent(events.adjustmentsDay, events.adjustmentsTime, events.userTimeZone),
      nominations: this.resolveScheduledEvent(events.nominationsDay, events.nominationsTime, events.userTimeZone),
      votes: this.resolveScheduledEvent(events.votesDay, events.votesTime, events.userTimeZone)
    }

    return schedule;
  }

  localDateToUtcDate(date: Date): Date | string {
    console.log('Receiving Date', date);
    date.toUTCString
    return date;
  }

  timeIdentity(serverTime: Date) {
    return serverTime;
  }

  resolveScheduledEvent(day: string, time: string, timeZoneName: string): WeeklyScheduleEventObject {
    const timeZone: TimeZone = getTimeZones().filter((timeZone: TimeZone) => timeZone.name === timeZoneName)[0];
    const localTime: DateTime = DateTime.fromISO(time);
    const utcTime: DateTime = DateTime.fromISO(time).minus({minutes: timeZone.currentTimeOffsetInMinutes});
    let utcDayIndex: number = this.days.indexOf(day);

    console.log(`If time zone is ${timeZoneName}, the offest is ${timeZone.currentTimeOffsetInMinutes / 60} hours so local hour ${localTime.hour} is UTC Hour ${utcTime.hour}`);
    if (timeZone.currentTimeOffsetInMinutes < 0 && utcTime.hour < localTime.hour) {
      utcDayIndex = (utcDayIndex + 1) % 7;
    }

    if (timeZone.currentTimeOffsetInMinutes > 0 && utcTime.hour > localTime.hour) {
      utcDayIndex--;
      if (utcDayIndex < 0) {
        utcDayIndex = 6;
      }
    }

    const eventInUtc: WeeklyScheduleEventObject = {
      day: this.days[utcDayIndex],
      time: utcTime.toISOTime()
    }

    console.log('Returing utcEvent:', eventInUtc);
    return eventInUtc;
  }

  enforceLocalDay(day: string, time: string, localTimeZoneName: string): string {
    const timeZone = this.timeZones.filter((timeZone: TimeZone) => {
      return timeZone.name === localTimeZoneName;
    })[0];

    const localTime: DateTime = DateTime.fromISO(time);
    return 'Nonday';
  }

  enforceLocalTime(timeL: string, localTimeZoneName: string, militaryTime: boolean): string {
    return '43:21 XM';
  }

  enforceLocalSchedule(game: any, localTimeZoneName: string): any {
    game.ordersDay = this.enforceLocalDay(
      game.ordersDay,
      game.ordersTime,
      localTimeZoneName
    );
    return game;
  }
}