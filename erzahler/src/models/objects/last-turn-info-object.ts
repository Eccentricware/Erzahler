import { TurnType } from '../enumeration/turn-type-enum';

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
  resolved_time?: Date;
  deadline_missed?: boolean;
  nominate_during_adjustments: boolean;
  vote_during_spring: boolean;
  nomination_timing: string;
  nomination_year?: number;
  current_year: number;
  year_number: number;
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
  resolvedTime?: Date;
  deadlineMissed?: boolean;
  nominateDuringAdjustments: boolean;
  voteDuringSpring: boolean;
  nominationTiming: string;
  nominationYear?: number;
  currentYear: number;
  yearNumber: number;
  highestRankedReq: number;
  allVotesControlled: boolean;
  unitsInRetreat: boolean;
  defaultNukeRange: number;
}

export interface NextTurns {
  pending: {
    type: TurnType;
    id?: number;
  };
  preliminary?: {
    type: TurnType;
    id?: number;
  };
  resolved?: {
    type: TurnType;
    id?: number;
  };
}
