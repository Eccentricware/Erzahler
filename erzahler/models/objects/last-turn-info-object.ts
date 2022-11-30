export interface GameState {
  gameId: number;
  turnId: number;
  deadline: Date;
  turnNumber: number;
  turnName: string;
  turnType: string;
  turnStatus: string;
  resolvedTime?: Date;
  deadlineMissed?: boolean;
  nominateDuringAdjustments: boolean;
  voteDuringSpring: boolean;
  nominationTiming: string;
  nominationYear?: number;
  currentYear: number;
  yearNumber: number;
}

export interface GameStateResult {
  game_id: number;
  turn_id: number;
  deadline: Date;
  turn_number: number;
  turn_name: string;
  turn_type: string;
  turn_status: string;
  resolved_time?: Date;
  deadline_missed?: boolean;
  nominate_during_adjustments: boolean;
  vote_during_spring: boolean;
  nomination_timing: string;
  nomination_year?: number;
  current_year: number;
  year_number: number;
}

export interface NextTurns {
  pending: string;
  preliminary?: string;
}