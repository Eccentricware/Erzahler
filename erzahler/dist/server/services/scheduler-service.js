"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const tzdb_1 = require("@vvo/tzdb");
const luxon_1 = require("luxon");
const day_of_week_enum_1 = require("../../models/enumeration/day_of_week-enum");
const node_schedule_1 = __importDefault(require("node-schedule"));
const start_timing_enum_1 = require("../../models/enumeration/start-timing-enum");
const game_status_enum_1 = require("../../models/enumeration/game-status-enum");
const resolutionService_1 = require("./resolutionService");
const turn_status_enum_1 = require("../../models/enumeration/turn-status-enum");
const turn_type_enum_1 = require("../../models/enumeration/turn-type-enum");
const connection_1 = require("../../database/connection");
class SchedulerService {
    constructor() {
        this.turnOrder = ['orders', 'retreats', 'adjustments', 'nominations', 'votes'];
        this.days = [
            day_of_week_enum_1.DayOfWeek.SUNDAY,
            day_of_week_enum_1.DayOfWeek.MONDAY,
            day_of_week_enum_1.DayOfWeek.TUESDAY,
            day_of_week_enum_1.DayOfWeek.WEDNESDAY,
            day_of_week_enum_1.DayOfWeek.THURSDAY,
            day_of_week_enum_1.DayOfWeek.FRIDAY,
            day_of_week_enum_1.DayOfWeek.SATURDAY
        ];
        this.dayValues = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6
        };
        this.timeZones = (0, tzdb_1.getTimeZones)();
    }
    getTimeZone(timeZoneName) {
        const timeZone = this.timeZones.filter((timeZone) => timeZone.name === timeZoneName)[0];
        return timeZone;
    }
    // Helpful for debugging by removing all extraneous variables
    extractEvents(settings, userTimeZone) {
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
    prepareStartSchedule(events) {
        // console.log('gameStart', events.gameStart);
        // console.log('firstTurnDeadline is a', typeof events.firstTurnDeadline);
        // console.log('Settings in prepareStartSchedule:', events);
        const schedule = {
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
    localDateToUtcDate(date) {
        // console.log('Receiving Date', date);
        date.toUTCString;
        return date;
    }
    timeIdentity(serverTime) {
        return serverTime;
    }
    resolveScheduledEvent(day, time, timeZoneName) {
        const timeZone = (0, tzdb_1.getTimeZones)().filter((timeZone) => timeZone.name === timeZoneName)[0];
        const localTime = luxon_1.DateTime.fromISO(time);
        const utcTime = luxon_1.DateTime.fromISO(time).minus({ minutes: timeZone.currentTimeOffsetInMinutes });
        let utcDayIndex = this.days.indexOf(day);
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
        const eventInUtc = {
            day: this.days[utcDayIndex],
            time: utcTime.toISOTime()
        };
        // console.log('Returing utcEvent:', eventInUtc);
        return eventInUtc;
    }
    enforceLocalDay(day, time, localTimeZoneName) {
        const timeZone = this.getTimeZone(localTimeZoneName);
        const utcTime = luxon_1.DateTime.fromISO(time);
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
    enforceLocalTime(timeUtc, localTimeZoneName, meridiemTime) {
        // console.log('Meridian time', meridiemTime);
        const timeZone = this.getTimeZone(localTimeZoneName);
        const utcDateTime = luxon_1.DateTime.fromISO(timeUtc);
        const localDateTime = utcDateTime.plus({ minutes: timeZone.currentTimeOffsetInMinutes });
        let localHour = localDateTime.hour;
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
    syncDeadlines() {
        return __awaiter(this, void 0, void 0, function* () {
            const resolutionService = new resolutionService_1.ResolutionService();
            const pendingTurns = yield connection_1.db.schedulerRepo.getUpcomingTurns(0);
            pendingTurns.forEach((turn) => {
                if (Date.parse(turn.deadline) < Date.now()) {
                    resolutionService.resolveTurn(turn);
                    console.log('Deadline in past: ' + true);
                }
                else {
                    console.log('Deadline in past: ' + false);
                }
                node_schedule_1.default.scheduleJob(`${turn.gameName} - ${turn.turnName}`, turn.deadline, () => {
                    resolutionService.resolveTurn(turn);
                });
            });
            // console.log(schedule);
        });
    }
    prepareGameStart(gameData) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolutionService = new resolutionService_1.ResolutionService();
            const gameId = gameData.gameId;
            const startDetails = yield this.lockStartDetails(gameId);
            yield connection_1.db.schedulerRepo.startGame([startDetails.gameStatus, startDetails.gameStart, gameId]);
            yield connection_1.db.schedulerRepo.setAssignmentsActive(gameId);
            // Is this clunky? Turn creation delayed until actual start
            yield connection_1.db.schedulerRepo.updateTurn([startDetails.gameStart, turn_status_enum_1.TurnStatus.RESOLVED, 0, gameId]);
            if (startDetails.gameStatus === game_status_enum_1.GameStatus.PLAYING) {
                resolutionService.startGame(gameData, startDetails);
            }
            else {
                node_schedule_1.default.scheduleJob(`${gameData.gameName} - Game Start`, startDetails.gameStart, () => {
                    resolutionService.startGame(gameData, startDetails);
                });
            }
        });
    }
    lockStartDetails(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const scheduleSettings = yield this.getGameScheduleSettings(gameId);
            if (!scheduleSettings) {
                return {
                    gameStatus: 'Error',
                    gameStart: luxon_1.DateTime.now(),
                    firstTurn: luxon_1.DateTime.now()
                };
            }
            let gameStatus = game_status_enum_1.GameStatus.READY;
            let gameStart = luxon_1.DateTime.utc(); // Now
            const now = luxon_1.DateTime.utc();
            let firstTurn = this.findNextOccurence(scheduleSettings.ordersDay, scheduleSettings.ordersTime);
            switch (scheduleSettings.turn1Timing) {
                case start_timing_enum_1.StartTiming.IMMEDIATE:
                    gameStatus = game_status_enum_1.GameStatus.PLAYING;
                    gameStart = now;
                    break;
                case start_timing_enum_1.StartTiming.STANDARD:
                    gameStatus = game_status_enum_1.GameStatus.READY;
                    gameStart = firstTurn;
                    firstTurn = firstTurn.plus({ week: 1 });
                    break;
                case start_timing_enum_1.StartTiming.REMAINDER:
                    gameStatus = game_status_enum_1.GameStatus.PLAYING;
                    gameStart = now;
                    firstTurn = firstTurn.plus({ week: 1 });
                    break;
                case start_timing_enum_1.StartTiming.DOUBLE:
                    gameStatus = game_status_enum_1.GameStatus.READY;
                    gameStart = firstTurn;
                    firstTurn = firstTurn.plus({ week: 2 });
                    break;
                case start_timing_enum_1.StartTiming.EXTENDED:
                    gameStatus = game_status_enum_1.GameStatus.PLAYING;
                    gameStart = now;
                    firstTurn = firstTurn.plus({ week: 2 });
                    break;
            }
            return {
                gameStatus: gameStatus,
                gameStart: gameStart,
                firstTurn: firstTurn
            };
        });
    }
    getGameScheduleSettings(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield connection_1.db.schedulerRepo.getScheduleSettings(gameId);
        });
    }
    findNextOccurence(eventDay, eventTime) {
        const now = luxon_1.DateTime.utc();
        let nextDeadline = luxon_1.DateTime.utc();
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
            nextDeadline = nextDeadline.plus({ week: 1 });
        }
        return nextDeadline;
    }
    isEventLaterInWeek(dayDifference, hourDifference, minuteDifference) {
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
    findNextTurns(gameState) {
        const nextTurns = { pending: { type: turn_type_enum_1.TurnType.SPRING_ORDERS } };
        const nominationsStarted = this.checkNominationsStarted(gameState);
        const nominateDuringAdjustments = gameState.nominateDuringAdjustments;
        const voteDuringSpring = gameState.voteDuringSpring;
        // (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) ->
        if (gameState.turnType === turn_type_enum_1.TurnType.ORDERS_AND_VOTES) {
            if (gameState.unitsInRetreat) {
                nextTurns.pending.type = turn_type_enum_1.TurnType.SPRING_RETREATS;
                nextTurns.preliminary = { type: turn_type_enum_1.TurnType.FALL_ORDERS };
            }
            else {
                nextTurns.pending.type = turn_type_enum_1.TurnType.FALL_ORDERS;
            }
        }
        // Spring Orders -> Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) -> Votes ->
        if (gameState.turnType === turn_type_enum_1.TurnType.SPRING_ORDERS) {
            if (gameState.unitsInRetreat) {
                nextTurns.pending.type = turn_type_enum_1.TurnType.SPRING_RETREATS;
                nextTurns.preliminary = { type: turn_type_enum_1.TurnType.FALL_ORDERS };
            }
            else {
                nextTurns.pending.type = turn_type_enum_1.TurnType.FALL_ORDERS;
            }
        }
        // Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) -> (Votes -> Spring Orders) ->
        if (gameState.turnType === turn_type_enum_1.TurnType.SPRING_RETREATS) {
            nextTurns.pending.type = turn_type_enum_1.TurnType.FALL_ORDERS;
        }
        // Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) -> (Votes -> Spring Orders) -> Spring Retreats ->
        if (gameState.turnType === turn_type_enum_1.TurnType.FALL_ORDERS) {
            if (gameState.unitsInRetreat) {
                nextTurns.pending.type = turn_type_enum_1.TurnType.FALL_RETREATS;
                if (nominationsStarted && nominateDuringAdjustments) {
                    nextTurns.preliminary = { type: turn_type_enum_1.TurnType.ADJ_AND_NOM };
                }
                else {
                    nextTurns.preliminary = { type: turn_type_enum_1.TurnType.ADJUSTMENTS };
                }
            }
            else {
                if (nominationsStarted && nominateDuringAdjustments) {
                    nextTurns.pending.type = turn_type_enum_1.TurnType.ADJ_AND_NOM;
                }
                else {
                    nextTurns.pending.type = turn_type_enum_1.TurnType.ADJUSTMENTS;
                }
            }
        }
        // Fall Retreats -> (Adjustments -> Nominations) -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders ->
        if (gameState.turnType === turn_type_enum_1.TurnType.FALL_RETREATS) {
            if (nominationsStarted && nominateDuringAdjustments) {
                nextTurns.pending.type = turn_type_enum_1.TurnType.ADJ_AND_NOM;
            }
            else if (nominationsStarted && !nominateDuringAdjustments) {
                nextTurns.pending.type = turn_type_enum_1.TurnType.ADJUSTMENTS;
                nextTurns.preliminary = { type: turn_type_enum_1.TurnType.NOMINATIONS };
            }
            else {
                nextTurns.pending.type = turn_type_enum_1.TurnType.ADJUSTMENTS;
            }
        }
        // Adjustments -> Nominations -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats ->
        if (gameState.turnType === turn_type_enum_1.TurnType.ADJUSTMENTS) {
            // nominateDuringAdjustments === false
            if (nominationsStarted) {
                nextTurns.pending.type = turn_type_enum_1.TurnType.NOMINATIONS;
            }
            else {
                nextTurns.pending.type = turn_type_enum_1.TurnType.SPRING_ORDERS;
            }
        }
        // (Adjustments -> Nominations) -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats ->
        if (gameState.turnType === turn_type_enum_1.TurnType.ADJ_AND_NOM) {
            if (nominationsStarted && voteDuringSpring) {
                nextTurns.pending.type = turn_type_enum_1.TurnType.ORDERS_AND_VOTES;
            }
            else {
                nextTurns.pending.type = turn_type_enum_1.TurnType.SPRING_ORDERS;
            }
        }
        // Nominations -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats -> Adjustments ->
        if (gameState.turnType === turn_type_enum_1.TurnType.NOMINATIONS) {
            // nominationsStarted === true && nominateDuringAdjustments === false
            if (voteDuringSpring) {
                nextTurns.pending.type = turn_type_enum_1.TurnType.ORDERS_AND_VOTES;
            }
            else {
                nextTurns.pending.type = turn_type_enum_1.TurnType.VOTES;
                nextTurns.preliminary = { type: turn_type_enum_1.TurnType.SPRING_ORDERS };
            }
        }
        // Votes -> Spring Orders -> Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) ->
        if (gameState.turnType === turn_type_enum_1.TurnType.VOTES) {
            nextTurns.pending.type = turn_type_enum_1.TurnType.SPRING_ORDERS;
        }
        return nextTurns;
    }
    checkNominationsStarted(gameState) {
        if (gameState.nominationTiming === 'set' && gameState.nominationYear) {
            if (gameState.currentYear > gameState.nominationYear) {
                return true;
            }
            if (gameState.currentYear === gameState.nominationYear) {
                const impactedTurns = [
                    turn_type_enum_1.TurnType.FALL_RETREATS,
                    turn_type_enum_1.TurnType.ADJUSTMENTS,
                    turn_type_enum_1.TurnType.ADJ_AND_NOM,
                    turn_type_enum_1.TurnType.NOMINATIONS // Next: [VOTES] or [ORDERS_AND_VOTES]
                ];
                if (impactedTurns.includes(gameState.turnType) ||
                    (gameState.turnType === turn_type_enum_1.TurnType.FALL_ORDERS && !gameState.unitsInRetreat)) {
                    return true;
                }
            }
        }
        return false;
    }
}
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=scheduler-service.js.map