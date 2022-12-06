import { getTimeZones, TimeZone } from '@vvo/tzdb';
import { StartScheduleObject } from "../../models/objects/start-schedule-object";
import { WeeklyScheduleEventObject } from "../../models/objects/weekly-schedule-event-object";
import { DateTime, HourNumbers } from 'luxon';
import { DayOfWeek } from '../../models/enumeration/day_of_week-enum';
import schedule from 'node-schedule';
import { StartScheduleEvents } from '../../models/objects/start-schedule-events-object';
import { Pool, QueryResult } from 'pg';
import { victorCredentials } from '../../secrets/dbCredentials';
import { getScheduleSettingsQuery } from '../../database/queries/scheduler/get-schedule-settings-query';
import { ScheduleSettingsQueryResult } from '../../models/objects/schedule-settings-query-object';
import { SchedulerSettingsBuilder } from '../../models/classes/schedule-settings-builder';
import { StartTiming } from '../../models/enumeration/start-timing-enum';
import { GameStatus } from '../../models/enumeration/game-status-enum';
import { StartDetails } from '../../models/objects/initial-times-object';
import { getUpcomingTurnsQuery } from '../../database/queries/scheduler/get-upcoming-turns-query';
import { ResolutionService } from './resolutionService';
import { setAssignmentsActiveQuery } from '../../database/queries/assignments/set-assignments-active-query';
import { startGameQuery } from '../../database/queries/game/start-game-query';
import { updateTurnQuery } from '../../database/queries/game/update-turn-query';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { FormattingService } from './formattingService';

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
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY
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

  getTimeZone(timeZoneName: string): TimeZone {
    const timeZone: TimeZone = this.timeZones.filter(
      (timeZone: TimeZone) => timeZone.name === timeZoneName
    )[0];

    return timeZone;
  }

  // Helpful for debugging by removing all extraneous variables
  extractEvents(settings: any, userTimeZone: string) {
    return {
      userTimeZone: userTimeZone,
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

  prepareStartSchedule(events: StartScheduleEvents): StartScheduleObject {
    // console.log('gameStart', events.gameStart);
    // console.log('firstTurnDeadline is a', typeof events.firstTurnDeadline);
    // console.log('Settings in prepareStartSchedule:', events);

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
    // console.log('Receiving Date', date);
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

    // console.log(`If time zone is ${timeZoneName}, the offest is ${timeZone.currentTimeOffsetInMinutes / 60} hours so local hour ${localTime.hour} is UTC Hour ${utcTime.hour}`);
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

    // console.log('Returing utcEvent:', eventInUtc);
    return eventInUtc;
  }

  enforceLocalDay(day: string, time: string, localTimeZoneName: string): string {
    const timeZone = this.getTimeZone(localTimeZoneName);
    const utcTime: DateTime = DateTime.fromISO(time);
    let shiftedDayIndex = this.days.indexOf(day);
    const shiftedTime = utcTime.hour + timeZone.currentTimeOffsetInMinutes / 60;

    if (shiftedTime < 0) {
      shiftedDayIndex--;
      if (shiftedDayIndex < 0) {
        shiftedDayIndex = 6;
      }
    }

    if (shiftedTime >= 24) {
      shiftedDayIndex++;
      if (shiftedDayIndex > 6) {
        shiftedDayIndex = 0;
      }
    }

    return this.days[shiftedDayIndex];
  }

  enforceLocalTime(timeUtc: string, localTimeZoneName: string, meridiemTime: boolean): string {
    // console.log('Meridian time', meridiemTime);
    const timeZone: TimeZone = this.getTimeZone(localTimeZoneName);

    const utcDateTime: DateTime = DateTime.fromISO(timeUtc);
    const localDateTime: DateTime = utcDateTime.plus({minutes: timeZone.currentTimeOffsetInMinutes});

    let localHour: string | HourNumbers = localDateTime.hour;
    let meridiem = 'AM';

    // console.log('local hour', localHour);

    if (meridiemTime) {
      if (localHour >= 12) {
        meridiem = 'PM';
      }

      if (localHour === 0) {
        localHour = 12;
      }
      if (localHour > 12) {
        localHour -= 12;
      }
    }

    localHour = String(localHour).padStart(2, '0');
    const localMinute = String(localDateTime.minute).padStart(2, '0');
    const localTimeString = `${localHour}:${localMinute}${meridiemTime ? ' ' + meridiem : ''}`;

    return localTimeString;
  }

  enforceLocalSchedule(game: any, localTimeZoneName: string): any {
    game.ordersDay = this.enforceLocalDay(
      game.ordersDay,
      game.ordersTime,
      localTimeZoneName
    );
    return game;
  }

  async syncDeadlines(): Promise<void> {
    const resolutionService: ResolutionService = new ResolutionService();
    const pool = new Pool(victorCredentials);

    const pendingTurns = await pool.query(getUpcomingTurnsQuery, [])
      .then((results: QueryResult<any>) => {
        return results.rows.map((turn: any) => {
          return {
            gameId: turn.game_id,
            turnId: turn.turn_id,
            gameName: turn.game_name,
            turnName: turn.turn_name,
            deadline: turn.deadline
          }
        })
      });

    pendingTurns.forEach((deadline: any) => {
      schedule.scheduleJob(
        `${deadline.gameName} - ${deadline.turnName}`,
        deadline.deadline,
        () => {
          resolutionService.resolveTurn(deadline.turnId);
        }
      );
    });

    // console.log(schedule);
  }

  async prepareGameStart(gameData: any): Promise<void> {
    const formattingService: FormattingService = new FormattingService();
    const resolutionService: ResolutionService = new ResolutionService();
    const pool = new Pool(victorCredentials);

    const gameId = gameData.gameId;
    const startDetails: StartDetails = await this.lockStartDetails(gameId);

    await pool.query(startGameQuery, [
      startDetails.gameStatus,
      startDetails.gameStart,
      gameId
    ]);

    await pool.query(setAssignmentsActiveQuery, [gameId]);

    // Is this clunky?
    await pool.query(updateTurnQuery, [startDetails.gameStart, TurnStatus.RESOLVED, 0, gameId])
      .then((turns: QueryResult<any>) => {
        return turns.rows.map((turn: any) => { return formattingService.convertKeysSnakeToCamel(turn); })[0];
      });

    const firstTurn = await pool.query(updateTurnQuery, [startDetails.firstTurn, TurnStatus.PENDING, 1, gameId])
      .then((turns: QueryResult<any>) => {
        return turns.rows.map((turn: any) => { return formattingService.convertKeysSnakeToCamel(turn); })[0];
      });

    if (startDetails.gameStatus === GameStatus.PLAYING) {
      resolutionService.startGame(gameId);
    } else {
      schedule.scheduleJob(
        `${gameData.gameName} - Game Start`,
        startDetails.gameStart,
        () => {
          resolutionService.startGame(gameId);
        }
      )
    }

    schedule.scheduleJob(
      `${gameData.gameName} - ${firstTurn.turnName}`,
      startDetails.firstTurn,
      () => {
        resolutionService.resolveTurn(firstTurn.turnId);
      }
    );
  }

  async lockStartDetails(gameId: number): Promise<StartDetails> {
    const scheduleSettings = await this.getGameScheduleSettings(gameId);

    let gameStatus = GameStatus.READY;
    let gameStart: DateTime = DateTime.utc(); // Now
    const now: DateTime = DateTime.utc();
    let firstTurn: DateTime = this.findNextOccurence(scheduleSettings.ordersDay, scheduleSettings.ordersTime);

    switch (scheduleSettings.turn1Timing) {
      case StartTiming.IMMEDIATE:
        gameStatus = GameStatus.PLAYING;
        gameStart = now;
        firstTurn = firstTurn;
        break;
      case StartTiming.STANDARD:
        gameStatus = GameStatus.READY;
        gameStart = firstTurn;
        firstTurn = firstTurn.plus({week: 1});
        break;
      case StartTiming.REMAINDER:
        gameStatus = GameStatus.PLAYING;
        gameStart = now;
        firstTurn = firstTurn.plus({week: 1});
        break;
      case StartTiming.DOUBLE:
        gameStatus = GameStatus.READY;
        gameStart = firstTurn;
        firstTurn = firstTurn.plus({week: 2});
        break;
      case StartTiming.EXTENDED:
        gameStatus = GameStatus.PLAYING;
        gameStart = now;
        firstTurn = firstTurn.plus({week: 2});
        break;
    }

    return {
      gameStatus: gameStatus,
      gameStart: gameStart,
      firstTurn: firstTurn
    }
  }

  async getGameScheduleSettings(gameId:number): Promise<any> {
    const pool = new Pool(victorCredentials);

    return await pool.query(getScheduleSettingsQuery, [gameId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((gameScheduleSettings: ScheduleSettingsQueryResult) => {
          return new SchedulerSettingsBuilder(gameScheduleSettings);
        })[0];
      })
      .catch((error: Error) => {
        console.log('Get Schedule Settings Query Error: ' + error.message);
      });
  }

  findNextOccurence(eventDay: string, eventTime: string): DateTime {
    const now: DateTime = DateTime.utc();
    let nextDeadline: DateTime = DateTime.utc();

    const eventHour = Number(eventTime.split(':')[0]);
    const eventMinute = Number(eventTime.split(':')[1]);

    // How much are we going to ADD to now to get the next deadline?

    // If positive, the current time in the week is past the deadline
    const dayDifference = this.dayValues[eventDay] - now.weekday;
    const hourDifference = eventHour - now.hour;
    const minuteDifference = eventMinute - now.minute;

    nextDeadline = now.plus({
      day: dayDifference,
      hour: hourDifference,
      minute: minuteDifference
    });

    const deadlineLaterInWeek = this.isEventLaterInWeek(dayDifference, hourDifference, minuteDifference);

    if (!deadlineLaterInWeek) {
      nextDeadline = nextDeadline.plus({week: 1});
    }

    return nextDeadline;
  }

  isEventLaterInWeek(dayDifference: number, hourDifference: number, minuteDifference: number): boolean {
    // Postive values mean deadline is later than now's time increment
    // Now Sunday, Deadline Monday, Difference = 1
    if (dayDifference < 0) {
      return false;
    }

    if (dayDifference === 0 && hourDifference < 0) {
      return false;
    }

    if (dayDifference === 0 && hourDifference === 0 && minuteDifference < 0) {
      return false;
    }

    return true;
  }
}