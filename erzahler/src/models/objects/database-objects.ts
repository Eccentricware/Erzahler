import { DateTime } from 'luxon';
import { TurnStatus } from '../enumeration/turn-status-enum';
import { TurnType } from '../enumeration/turn-type-enum';

export interface TurnResult {
  turn_id?: number;
  game_id: number;
  turn_number: number;
  turn_name: string;
  turn_type: TurnType;
  turn_status: TurnStatus;
  year_number: number;
  deadline: Date | DateTime | string;
}

export interface Turn {
  turnId?: number;
  gameId: number;
  turnNumber: number;
  turnName: string;
  turnType: TurnType;
  turnStatus: TurnStatus;
  yearNumber: number;
  deadline: Date | DateTime | string;
}

export interface NominationRowResult {
  nomination_id?: number;
  turn_id: number;
  nominator_id: number;
  signature: string;
  votes_required: number;
  country_ids: number[];
  votes_received?: number;
  winner?: boolean;
  valid?: boolean;
}

export interface NominationRow {
  nominationId?: number;
  turnId: number;
  nominatorId: number;
  signature: string;
  votesRequired: number;
  countryIds: number[];
  votesReceived?: number;
  winner?: boolean;
  valid?: boolean;
}