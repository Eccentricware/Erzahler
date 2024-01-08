import { getTimeZones, TimeZone } from '@vvo/tzdb';
import { StartScheduleObject } from '../../models/objects/start-schedule-object';
import { WeeklyScheduleEventObject } from '../../models/objects/weekly-schedule-event-object';
import { DateTime, HourNumbers } from 'luxon';
import { DayOfWeek } from '../../models/enumeration/day_of_week-enum';
import schedule, { Job } from 'node-schedule';
import { NsDate, ScheduledJob, StartScheduleEvents } from '../../models/objects/start-schedule-events-object';
import { StartTiming } from '../../models/enumeration/start-timing-enum';
import { GameStatus } from '../../models/enumeration/game-status-enum';
import { StartDetails } from '../../models/objects/initial-times-object';
import { ResolutionService } from './resolution-service';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { GameState, NextTurns } from '../../models/objects/last-turn-info-object';
import { db } from '../../database/connection';
import { UpcomingTurn } from '../../models/objects/scheduler/upcoming-turns-object';
import { GameSettings } from '../../models/objects/games/game-settings-object';
import { NewGameData } from '../../models/objects/games/new-game-data-object';
import { SchedulerSettingsBuilder } from '../../models/classes/schedule-settings-builder';
import { formatDateTime, formatTurnName, terminalAddendum, terminalLog } from '../utils/general';
import { StartSchedule } from '../../models/objects/games/game-schedule-objects';
import { Turn } from '../../models/objects/database-objects';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';

export class SchedulerService {
  timeZones: TimeZone[];
  turnOrder: string[] = ['orders', 'retreats', 'adjustments', 'nominations', 'votes'];

  days: string[] = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY
  ];

  dayValues: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  };

  constructor() {
    this.timeZones = getTimeZones();
  }

  getTimeZone(timeZoneName: string): TimeZone {
    const timeZone: TimeZone = this.timeZones.filter((timeZone: TimeZone) => timeZone.name === timeZoneName)[0];

    return timeZone;
  }

  // Helpful for debugging by removing all extraneous variables
  extractEvents(settings: NewGameData, userTimeZone: string): StartScheduleEvents {
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
    };
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
    };

    return schedule;
  }

  localDateToUtcDate(date: Date): Date | string {
    // console.log('Receiving Date', date);
    date.toUTCString;
    return date;
  }

  timeIdentity(serverTime: Date) {
    return serverTime;
  }

  resolveScheduledEvent(day: string, time: string, timeZoneName: string): WeeklyScheduleEventObject {
    const timeZone: TimeZone = getTimeZones().filter((timeZone: TimeZone) => timeZone.name === timeZoneName)[0];
    const localTime: DateTime = DateTime.fromISO(time);
    const utcTime: DateTime = DateTime.fromISO(time).minus({ minutes: timeZone.currentTimeOffsetInMinutes });
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
    };

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
    const localDateTime: DateTime = utcDateTime.plus({ minutes: timeZone.currentTimeOffsetInMinutes });

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

  // enforceLocalSchedule(game: any, localTimeZoneName: string): any {
  //   game.ordersDay = this.enforceLocalDay(game.ordersDay, game.ordersTime, localTimeZoneName);
  //   return game;
  // }



  async syncDeadlines(): Promise<void> {
    terminalLog('Syncing Deadlines');
    const resolutionService: ResolutionService = new ResolutionService();

    const gamesStarting = await db.schedulerRepo.getGamesStarting();
    terminalAddendum(
      'Deadlines',
      `Found ${gamesStarting.length} ${gamesStarting.length === 1 ? 'game' : 'games'} ready`
    );

    gamesStarting.forEach(async (game: StartSchedule) => {
      if (Date.parse(game.startTime.toISOString()) < Date.now()) {
        terminalAddendum(
          'Deadlines',
          `${game.gameName} (${game.gameId}) start time ${formatDateTime(game.startTime)} has passed. Starting now.`
        );
        await resolutionService.startGame(game.gameId);
      } else {
        terminalLog(`Scheduling start for game ${game.gameName} (${game.gameId}) at ${formatDateTime(game.startTime)}`);
        schedule.scheduleJob(
          `G-${game.gameId}`,
          game.startTime,
          () => { resolutionService.startGame(game.gameId); }
        );
      }
    });

    const upcomingTurns = await db.schedulerRepo.getUpcomingTurns(0);
    terminalAddendum('Deadlines', `Found ${upcomingTurns.length} pending turns`);

    upcomingTurns.forEach(async (turn: UpcomingTurn) => {
      if (turn.turnStatus === TurnStatus.PENDING && Date.parse(turn.deadline.toISOString()) < Date.now()) {
        terminalAddendum(`Deadlines`, `${turn.gameName} (${turn.gameId}) ${turn.turnName} (${formatDateTime(turn.deadline)}) has expired. Resolving`);
        resolutionService.resolveTurn(turn.turnId);

      } else if (turn.turnStatus === TurnStatus.PENDING) {
        terminalAddendum(`Deadlines`, `${turn.gameName} (${turn.gameId}) ${turn.turnName} (${formatDateTime(turn.deadline)}) pending`);
        this.scheduleTurn(turn.turnId, turn.deadline);
        // schedule.scheduleJob(
        //   `T-${turn.turnId}`,
        //   turn.deadline,
        //   () => { resolutionService.resolveTurn(turn.turnId); }
        // );
      }
    });
  }

  async scheduleTurn(turnId: number, deadline: Date | DateTime | string): Promise<void> {
    const resolutionService: ResolutionService = new ResolutionService();
    if (deadline instanceof Date) {
      terminalLog(`Scheduling turn ${turnId} for ${formatDateTime(deadline)}`);
    }

    schedule.scheduleJob(
      `T-${turnId}`,
     deadline,
      () => { resolutionService.resolveTurn(turnId); }
    );
  }

  /**
   * Finalizes assignments and locks in game start time.
   *
   * @param gameData
   */
  async readyGame(gameData: GameSettings): Promise<void> {
    const resolutionService: ResolutionService = new ResolutionService();

    const gameId = gameData.gameId;
    const startDetails: StartDetails = await this.getStartDetails(gameId);

    await db.schedulerRepo.readyGame([startDetails.gameStart, gameId]);
    await db.schedulerRepo.setAssignmentsActive(gameId);

    if (startDetails.gameStatus === GameStatus.PLAYING) {
      resolutionService.startGame(gameId);
    } else {
      schedule.scheduleJob(
        `G-${gameData.gameId}`,
        startDetails.gameStart,
        () => { resolutionService.startGame(gameId); }
      );
    }
  }

  /**
   * Changes game state to ready and schedules the first turn.
   *
   * @param gameId
   * @returns
   */
  async getStartDetails(gameId: number): Promise<StartDetails> {
    const scheduleSettings = await this.getGameScheduleSettings(gameId);
    if (!scheduleSettings) {
      return {
        gameName: 'Error',
        gameStatus: 'Error',
        gameStart: 'Error',
        stylizedYear: 0,
        firstTurn: 'Error'
      };
    }

    let gameStatus = GameStatus.READY;
    let gameStart: DateTime = DateTime.utc(); // Now
    const now: DateTime = DateTime.utc();
    let firstTurn: DateTime = this.findNextOccurence(scheduleSettings.ordersDay, scheduleSettings.ordersTime);

    switch (scheduleSettings.turn1Timing) {
      case StartTiming.IMMEDIATE:
        gameStatus = GameStatus.PLAYING;
        // gameStart = now;
        break;
      case StartTiming.STANDARD:
        gameStatus = GameStatus.READY;
        gameStart = firstTurn;
        firstTurn = firstTurn.plus({ week: 1 });
        break;
      case StartTiming.REMAINDER:
        gameStatus = GameStatus.PLAYING;
        // gameStart = now;
        firstTurn = firstTurn.plus({ week: 1 });
        break;
      case StartTiming.DOUBLE:
        gameStatus = GameStatus.READY;
        gameStart = firstTurn;
        firstTurn = firstTurn.plus({ week: 2 });
        break;
      case StartTiming.EXTENDED:
        gameStatus = GameStatus.PLAYING;
        // gameStart = now;
        firstTurn = firstTurn.plus({ week: 2 });
        break;
    }

    return {
      gameName: scheduleSettings.gameName,
      gameStatus: gameStatus,
      gameStart: gameStart.toString(),
      stylizedYear: scheduleSettings.stylizedStartYear + 1,
      firstTurn: firstTurn.toString()
    };
  }

  async getGameScheduleSettings(gameId: number): Promise<SchedulerSettingsBuilder | void> {
    return await db.schedulerRepo.getScheduleSettings(gameId);
  }

  /**
   * Finds the next time the event will occur.
   * If the check is on cadence, return now.
   *
   * @param eventDay
   * @param eventTime
   * @returns
   */
  findNextOccurence(eventDay: string, eventTime: string, referenceTime?: DateTime): DateTime {
    const reference: DateTime = referenceTime ? referenceTime : DateTime.utc(); // Now
    let nextDeadline: DateTime = DateTime.utc();

    const eventHour = Number(eventTime.split(':')[0]);
    const eventMinute = Number(eventTime.split(':')[1]);

    // How much are we going to ADD to now to get the next deadline?

    // If positive, the current time in the week is past the deadline
    const dayDifference = this.dayValues[eventDay] - reference.weekday;
    const hourDifference = eventHour - reference.hour;
    const minuteDifference = eventMinute - reference.minute;

    nextDeadline = reference.plus({
      day: dayDifference,
      hour: hourDifference,
      minute: minuteDifference
    });

    const deadlineLaterInWeek = this.isEventLaterInWeek(dayDifference, hourDifference, minuteDifference);

    if (!deadlineLaterInWeek) {
      nextDeadline = nextDeadline.plus({ week: 1 });
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

    if (dayDifference === 0 && hourDifference === 0 && minuteDifference <= 0) {
      return false;
    }

    return true;
  }

  findNextTurns(currentTurn: UpcomingTurn, gameState: GameState, unitsRetreating: boolean): NextTurns {
    const nextTurns: NextTurns = {
      pending: {
        turnNumber: currentTurn.turnNumber + 1,
        // These rest are all defaults for elegance. Spring would iterate year. Processed at end of year.
        type: TurnType.SPRING_ORDERS,
        deadline: DateTime.utc(),
        yearNumber: currentTurn.yearNumber,
        yearStylized: gameState.stylizedStartYear + currentTurn.yearNumber,
        turnName: formatTurnName(TurnType.SPRING_ORDERS, gameState.stylizedStartYear + currentTurn.yearNumber)
      }
    };

    const nominationsStarted = this.checkNominationsStarted(gameState, unitsRetreating);
    const nominateDuringAdjustments = gameState.nominateDuringAdjustments;
    const voteDuringSpring = gameState.voteDuringSpring;

    // (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) ->
    // (Orders and Votes) and (Spring Orders) both result in Spring Retreats -> Fall Orders
    if ([TurnType.ORDERS_AND_VOTES, TurnType.SPRING_ORDERS].includes(currentTurn.turnType)) {
      if (unitsRetreating) {
        nextTurns.pending.type = TurnType.SPRING_RETREATS;
        nextTurns.pending.deadline = this.findNextOccurence(gameState.retreatsDay, gameState.retreatsTime.toString());

        nextTurns.preliminary = {
          type: TurnType.FALL_ORDERS,
          turnName: formatTurnName(TurnType.FALL_ORDERS, currentTurn.yearStylized),
          turnNumber: currentTurn.turnNumber + 2,
          deadline: this.findNextOccurence(gameState.ordersDay, gameState.ordersTime.toString(), nextTurns.pending.deadline),
          yearNumber: currentTurn.yearNumber,
          yearStylized: currentTurn.yearStylized
        };

      } else {
        nextTurns.pending.type = TurnType.FALL_ORDERS;
        // nextTurns.pending.turnNumber = currentTurn.turnNumber + 2;
        nextTurns.pending.deadline = this.findNextOccurence(gameState.ordersDay, gameState.ordersTime.toString());
      }
    }

    // Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) -> (Votes -> Spring Orders) ->
    if (currentTurn.turnType === TurnType.SPRING_RETREATS) {
      nextTurns.pending.type = TurnType.FALL_ORDERS;
      nextTurns.pending.deadline = this.findNextOccurence(gameState.ordersDay, gameState.ordersTime.toString());
    }

    // Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) -> (Votes -> Spring Orders) -> Spring Retreats ->
    if (currentTurn.turnType === TurnType.FALL_ORDERS) {
      if (unitsRetreating) {
        nextTurns.pending.type = TurnType.FALL_RETREATS;
        nextTurns.pending.deadline = this.findNextOccurence(gameState.retreatsDay, gameState.retreatsTime.toString());

        nextTurns.preliminary = {
          type: TurnType.ADJUSTMENTS,
          turnName: formatTurnName(TurnType.ADJUSTMENTS, currentTurn.yearStylized),
          turnNumber: currentTurn.turnNumber + 2,
          deadline: this.findNextOccurence(gameState.adjustmentsDay, gameState.adjustmentsTime.toString(), nextTurns.pending.deadline),
          yearNumber: currentTurn.yearNumber,
          yearStylized: currentTurn.yearStylized
        };

        if (nominationsStarted && nominateDuringAdjustments) {
          nextTurns.preliminary.type = TurnType.ADJ_AND_NOM;
        }

      } else {
        nextTurns.pending.type = nominationsStarted && nominateDuringAdjustments ? TurnType.ADJ_AND_NOM : TurnType.ADJUSTMENTS;
        // nextTurns.pending.turnNumber = currentTurn.turnNumber + 2;
        nextTurns.pending.deadline = this.findNextOccurence(gameState.adjustmentsDay, gameState.adjustmentsTime.toString());
      }
    }

    // Fall Retreats -> (Adjustments -> Nominations) -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders ->
    if (currentTurn.turnType === TurnType.FALL_RETREATS) {
      const includeNominations = nominationsStarted && nominateDuringAdjustments;

      nextTurns.pending.type = includeNominations ? TurnType.ADJ_AND_NOM : TurnType.ADJUSTMENTS;
      nextTurns.pending.deadline = this.findNextOccurence(gameState.adjustmentsDay, gameState.adjustmentsTime.toString());

      if (nominationsStarted && !nominateDuringAdjustments) {
        nextTurns.preliminary = {
          type: TurnType.NOMINATIONS,
          turnName: formatTurnName(TurnType.NOMINATIONS, currentTurn.yearStylized),
          turnNumber: currentTurn.turnNumber + 2,
          deadline: this.findNextOccurence(gameState.nominationsDay, gameState.nominationsTime.toString(), nextTurns.pending.deadline),
          yearNumber: currentTurn.yearNumber,
          yearStylized: currentTurn.yearStylized
        };
      }
    }

    // Adjustments -> Nominations -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats ->
    if (currentTurn.turnType === TurnType.ADJUSTMENTS) {
      // If turn is Adjustements, then nominateDuringAdjustments === false
      if (nominationsStarted) {
        nextTurns.pending.type = TurnType.NOMINATIONS;
        nextTurns.pending.deadline = this.findNextOccurence(
          gameState.nominationsDay,
          gameState.nominationsTime.toString()
        );
      } else {
        nextTurns.pending.type = TurnType.SPRING_ORDERS;
        nextTurns.pending.deadline = this.findNextOccurence(gameState.ordersDay, gameState.ordersTime.toString());
        nextTurns.pending.yearNumber = currentTurn.yearNumber + 1;
        nextTurns.pending.yearStylized = currentTurn.yearStylized + 1;
      }
    }

    // (Adjustments -> Nominations) -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats ->
    if (currentTurn.turnType === TurnType.ADJ_AND_NOM) {
      // If turn is ADJ_AND_NOM, then nominationsStarted === true
      nextTurns.pending.yearNumber = currentTurn.yearNumber + 1;
      nextTurns.pending.yearStylized = currentTurn.yearStylized + 1;

      if (voteDuringSpring) {
        nextTurns.pending.type = TurnType.ORDERS_AND_VOTES;
        nextTurns.pending.deadline = this.findNextOccurence(gameState.ordersDay, gameState.ordersTime.toString());
        nextTurns.pending.yearNumber = currentTurn.yearNumber + 1;
        nextTurns.pending.yearStylized = currentTurn.yearStylized + 1;

      } else {
        nextTurns.pending.type = TurnType.VOTES;
        nextTurns.pending.deadline = this.findNextOccurence(gameState.votesDay, gameState.votesTime.toString());

        nextTurns.preliminary = {
          type: TurnType.SPRING_ORDERS,
          turnName: formatTurnName(TurnType.SPRING_ORDERS, currentTurn.yearStylized + 1),
          turnNumber: currentTurn.turnNumber + 2,
          deadline: this.findNextOccurence(gameState.ordersDay, gameState.ordersTime.toString(), nextTurns.pending.deadline),
          yearNumber: currentTurn.yearNumber + 1,
          yearStylized: currentTurn.yearStylized + 1
        };
      }
    }

    // Nominations -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats -> Adjustments ->
    if (currentTurn.turnType === TurnType.NOMINATIONS) {
      // nominationsStarted === true && nominateDuringAdjustments === false
      if (voteDuringSpring) {
        nextTurns.pending.type = TurnType.ORDERS_AND_VOTES;
        nextTurns.pending.deadline = this.findNextOccurence(gameState.ordersDay, gameState.ordersTime.toString());
        nextTurns.pending.yearNumber = currentTurn.yearNumber + 1;
        nextTurns.pending.yearStylized = currentTurn.yearStylized + 1;

      } else {
        nextTurns.pending.type = TurnType.VOTES;
        nextTurns.pending.deadline = this.findNextOccurence(gameState.votesDay, gameState.votesTime.toString());

        nextTurns.preliminary = {
          type: TurnType.SPRING_ORDERS,
          turnName: formatTurnName(TurnType.SPRING_ORDERS, currentTurn.yearStylized + 1),
          turnNumber: currentTurn.turnNumber + 2,
          deadline: this.findNextOccurence(gameState.ordersDay, gameState.ordersTime.toString(), nextTurns.pending.deadline),
          yearNumber: currentTurn.yearNumber + 1,
          yearStylized: currentTurn.yearStylized + 1
        };
      }
    }

    // Votes -> Spring Orders -> Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) ->
    if (currentTurn.turnType === TurnType.VOTES) {
      nextTurns.pending.yearNumber = currentTurn.yearNumber + 1;
      nextTurns.pending.yearStylized = currentTurn.yearStylized + 1;
    }

    nextTurns.pending.turnName = formatTurnName(nextTurns.pending.type, nextTurns.pending.yearStylized);

    return nextTurns;
  }

  checkNominationsStarted(gameState: GameState, unitsRetreating: boolean): boolean {
    if (gameState.nominationTiming === 'set' && gameState.nominationYear) {
      if (gameState.currentYear > gameState.nominationYear) {
        return true;
      }

      if (gameState.currentYear === gameState.nominationYear) {
        const impactedTurns = [
          TurnType.FALL_RETREATS, // Next: ADJUSTMENTS or [ADJ_AND_NOM]
          TurnType.ADJUSTMENTS, // Next: [NOMINATIONS]
          TurnType.ADJ_AND_NOM, // Next: [VOTES] or [ORDERS_AND_VOTES]
          TurnType.NOMINATIONS // Next: [VOTES] or [ORDERS_AND_VOTES]
        ];

        if (
          impactedTurns.includes(gameState.turnType) ||
          (gameState.turnType === TurnType.FALL_ORDERS && !unitsRetreating)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Prints current time immediately, according to env time zone, and then every increment in minutes.
   * @param interval
   */
  checkIn(minuteInterval: number): void {
    terminalLog('Server Start');

    const now = DateTime.now();
    const minUntilIncrement = minuteInterval - (now.minute % minuteInterval);
    const start = now.plus({
      minute: minUntilIncrement - 1 - minuteInterval,
      second: 59 - now.second,
      millisecond: 1000 - now.millisecond
    });

    schedule.scheduleJob(
      {
        start: start.toJSDate(),
        rule: `*/${minuteInterval} * * * *`
      },

      () => { terminalLog('Check In'); }
    );
  }

  async getAllEvents(): Promise<ScheduledJob[]> {
    const scheduledJobs = [];

    // console.log('scheduledJobs', schedule.scheduledJobs);

    for (const jobName in schedule.scheduledJobs) {
      const job: Job = schedule.scheduledJobs[jobName];
      // console.log('job', job);

      const jobDate: NsDate = job.nextInvocation();

      const scheduledJob: ScheduledJob = {
        name: jobName,
        date: {
          ts: jobDate.ts,
          zone: jobDate._zone,
          loc: jobDate.loc,
          invalid: jobDate.invalid,
          weekData: jobDate.weekData,
          c: jobDate.c,
          o: jobDate.o,
          isLuxonDateTime: jobDate.isLuxonDateTime
        }
      };

      scheduledJobs.push(scheduledJob);
    }

    return scheduledJobs;
  }
}
