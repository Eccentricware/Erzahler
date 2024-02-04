import { DateTime } from 'luxon';
import { DayOfWeek } from '../enumeration/day_of_week-enum';
import { TurnType } from '../enumeration/turn-type-enum';
import { CountryRank } from '../enumeration/country-enum';

export interface GameStateResult {
  game_id: number;
  game_name: string;
  turn_id: number;
  deadline: Date;
  turn_number: number;
  turn_name: string;
  turn_type: TurnType;
  turn_status: string;
  pending_turn_id: number;
  pending_turn_type: string;
  preliminary_turn_id: number;
  preliminary_turn_type: string;
  orders_day: DayOfWeek;
  orders_time: Date;
  orders_span: number;
  retreats_day: DayOfWeek;
  retreats_time: Date;
  retreats_span: number;
  adjustments_day: DayOfWeek;
  adjustments_time: Date;
  adjustments_span: number;
  nominations_day: DayOfWeek;
  nominations_time: Date;
  nominations_span: number;
  votes_day: DayOfWeek;
  votes_time: Date;
  votes_span: number;
  resolved_time?: Date;
  deadline_missed?: boolean;
  nominate_during_adjustments: boolean;
  vote_during_spring: boolean;
  nomination_timing: string;
  nomination_year?: number;
  current_year: number;
  year_number: number;
  stylized_start_year: number;
  base_final: number;
  penalty_a: number;
  penalty_b: number;
  penalty_c: number;
  penalty_d: number;
  penalty_e: number;
  penalty_f: number;
  penalty_g: number;
  highest_ranked_req: number;
  all_votes_controlled: boolean;
  unit_in_retreat: boolean;
  default_nuke_range: number;
}

export interface GameState {
  gameId: number;
  gameName: string;
  turnId: number;
  deadline: Date;
  turnNumber: number;
  turnName: string;
  turnType: TurnType;
  turnStatus: string;
  pendingTurnId: number;
  pendingTurnType: TurnType;
  preliminaryTurnId?: number;
  preliminaryTurnType?: TurnType;
  ordersDay: DayOfWeek;
  ordersTime: Date;
  ordersSpan: number;
  retreatsDay: DayOfWeek;
  retreatsTime: Date;
  retreatsSpan: number;
  adjustmentsDay: DayOfWeek;
  adjustmentsTime: Date;
  adjustmentsSpan: number;
  nominationsDay: DayOfWeek;
  nominationsTime: Date;
  nominationsSpan: number;
  votesDay: DayOfWeek;
  votesTime: Date;
  votesSpan: number;
  resolvedTime?: Date;
  deadlineMissed?: boolean;
  nominateDuringAdjustments: boolean;
  voteDuringSpring: boolean;
  nominationTiming: string;
  nominationYear?: number;
  currentYear: number;
  yearNumber: number;
  stylizedStartYear: number;
  highestRankedReq: number;
  votingSchedule: {
    baseFinal: number;
    penalties: Record<CountryRank, number>;
  }
  allVotesControlled: boolean;
  unitsInRetreat: boolean;
  defaultNukeRange: number;
}

export interface NextTurns {
  pending: Turn;
  preliminary?: Turn;
  skipped?: Turn;
}

interface Turn {
  turnName: string;
  type: TurnType;
  turnNumber: number;
  deadline: Date | DateTime | string;
  yearNumber: number;
  yearStylized: number;
  turnId?: number;
}