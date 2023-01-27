import { TurnStatus } from "../../enumeration/turn-status-enum";
import { TurnType } from "../../enumeration/turn-type-enum";
import { Order, UnitOptionsFinalized } from "../option-context-objects";

export interface UpcomingTurnResult {
  game_id: number;
  turn_id: number;
  game_name: string;
  turn_name: string;
  turn_type: string;
  turn_status: string;
  deadline: string;
  defaults_ready: boolean;
}
export interface UpcomingTurn {
  gameId: number;
  turnId: number;
  gameName: string;
  turnName: string;
  turnType: TurnType;
  turnStatus: TurnStatus;
  deadline: string;
  defaultsReady: boolean;
}

export interface TurnOptions {
  playerId: number;
  countryId?: number;
  countryName?: string;
  pending?: SingleTurnOptions,
  preliminary?: SingleTurnOptions
}

interface SingleTurnOptions {
  turnType: string;
  name: string;
  deadline: Date | string;
  units?: UnitOptionsFinalized[]; // If (spring orders/retreats or fall orders/retreats)
  transfers?: any;
  builds?: any;
  disbands?: any;
  nominations?: any;
  votes?: any;
}

