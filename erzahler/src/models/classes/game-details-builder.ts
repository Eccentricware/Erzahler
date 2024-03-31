import { SchedulerService } from '../../server/services/scheduler-service';
import { GameDetailsQueryObject } from '../objects/game-details-query-object';
import { CoalitionSchedule } from '../objects/games/coalition-schedule-objects';

export class GameDetailsBuilder {
  scheduler: SchedulerService = new SchedulerService();
  gameId: number;
  gameName: string;
  timeCreated: Date;
  gameStatus: string;
  currentYear: number;
  stylizedStartYear: string;
  concurrentGamesLimit: number;
  privateGame: boolean;
  hiddenGame: boolean;
  blindAdministrators: boolean;
  assignmentMethod: string;
  deadlineType: string;
  meridiemTime: boolean;
  observeDst: boolean;
  turn1Timing: string;
  startTime: string;
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
  nmrToleranceTotal: number;
  nmrToleranceOrders: number;
  nmrToleranceRetreats: number;
  nmrToleranceAdjustments: number;
  voteDelayEnabled: boolean;
  voteDelayLock: number;
  voteDelayPercent: number;
  voteDelayCount: number;
  voteDelayDisplayPercent: number;
  voteDelayDisplayCount: number;
  partialRosterStart: boolean;
  finalReadinessCheck: boolean;
  nominationTiming: string;
  nominationYear: number;
  automaticAssignments: boolean;
  ratingLimitsEnabled: boolean;
  funMin: number;
  funMax: number;
  skillMin: number;
  skillMax: number;
  isAdmin: boolean;
  coalitionSchedule: CoalitionSchedule;
  readyTime: string;

  constructor(rawGame: GameDetailsQueryObject, localTimeZoneName: string, meridiemTime: boolean) {
    this.gameId = rawGame.game_id;
    this.gameName = rawGame.game_name;
    this.timeCreated = rawGame.time_created;
    this.gameStatus = rawGame.game_status;
    this.currentYear = rawGame.current_year;
    this.stylizedStartYear = rawGame.stylized_start_year;
    this.concurrentGamesLimit = rawGame.concurrent_games_limit;
    this.privateGame = rawGame.private_game;
    this.hiddenGame = rawGame.hidden_game;
    this.blindAdministrators = rawGame.blind_administrators;
    this.assignmentMethod = rawGame.assignment_method;
    this.deadlineType = rawGame.deadline_type;
    this.meridiemTime = rawGame.meridiem_time;
    this.observeDst = rawGame.observe_dst;
    this.turn1Timing = rawGame.turn_1_timing;
    this.startTime = rawGame.start_time;
    this.ordersDay = this.scheduler.enforceLocalDay(rawGame.orders_day, rawGame.orders_time, localTimeZoneName);
    this.ordersTime = this.ordersTime = this.scheduler.enforceLocalTime(
      rawGame.orders_time,
      localTimeZoneName,
      meridiemTime
    );
    this.retreatsDay = this.scheduler.enforceLocalDay(rawGame.retreats_day, rawGame.retreats_time, localTimeZoneName);
    this.retreatsTime = this.scheduler.enforceLocalTime(rawGame.retreats_time, localTimeZoneName, meridiemTime);
    this.adjustmentsDay = this.scheduler.enforceLocalDay(
      rawGame.adjustments_day,
      rawGame.adjustments_time,
      localTimeZoneName
    );
    this.adjustmentsTime = this.scheduler.enforceLocalTime(rawGame.adjustments_time, localTimeZoneName, meridiemTime);
    this.nominationsDay = this.scheduler.enforceLocalDay(
      rawGame.nominations_day,
      rawGame.nominations_time,
      localTimeZoneName
    );
    this.nominationsTime = this.scheduler.enforceLocalTime(rawGame.nominations_time, localTimeZoneName, meridiemTime);
    this.votesDay = this.scheduler.enforceLocalDay(rawGame.votes_day, rawGame.votes_time, localTimeZoneName);
    this.votesTime = this.scheduler.enforceLocalTime(rawGame.votes_time, localTimeZoneName, meridiemTime);
    this.nmrToleranceTotal = rawGame.nmr_tolerance_total;
    this.nmrToleranceOrders = rawGame.nmr_tolerance_orders;
    this.nmrToleranceRetreats = rawGame.nmr_tolerance_retreats;
    this.nmrToleranceAdjustments = rawGame.nmr_tolerance_adjustments;
    this.voteDelayEnabled = rawGame.vote_delay_enabled;
    this.voteDelayLock = rawGame.vote_delay_lock;
    this.voteDelayPercent = rawGame.vote_delay_percent;
    this.voteDelayCount = rawGame.vote_delay_count;
    this.voteDelayDisplayPercent = rawGame.vote_delay_display_percent;
    this.voteDelayDisplayCount = rawGame.vote_delay_display_count;
    this.partialRosterStart = rawGame.partial_roster_start;
    this.finalReadinessCheck = rawGame.final_readiness_check;
    this.nominationTiming = rawGame.nomination_timing;
    this.nominationYear = rawGame.nomination_year;
    this.automaticAssignments = rawGame.automatic_assignments;
    this.ratingLimitsEnabled = rawGame.rating_limits_enabled;
    this.funMin = rawGame.fun_min;
    this.funMax = rawGame.fun_max;
    this.skillMin = rawGame.skill_min;
    this.skillMax = rawGame.skill_max;
    this.isAdmin = rawGame.display_as_admin;
    this.coalitionSchedule = {
      baseFinal: rawGame.base_final,
      totalPossible: rawGame.total_possible,
      penalties: {
        a: rawGame.penalty_a,
        b: rawGame.penalty_b,
        c: rawGame.penalty_c,
        d: rawGame.penalty_d,
        e: rawGame.penalty_e,
        f: rawGame.penalty_f,
        g: rawGame.penalty_g
      }
    };
    this.readyTime = rawGame.ready_time;
  }
}
