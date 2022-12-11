import { DateTime } from "luxon";
import { TurnStatus } from "../enumeration/turn-status-enum";
import { TurnType } from "../enumeration/turn-type-enum";

export interface TurnPG {
  turn_id?: number;
  game_id?: number;
  turn_number?: number;
  turn_name?: string;
  turn_type?: TurnType;
  turn_status?: TurnStatus;
  year_number?: number;
  deadline?: Date | DateTime | string;
}

export interface TurnTS {
  turnId?: number;
  gameId?: number;
  turnNumber?: number;
  turnName?: string;
  turnType?: TurnType;
  turnStatus?: TurnStatus;
  yearNumber?: number;
  deadline?: Date | DateTime | string;
}