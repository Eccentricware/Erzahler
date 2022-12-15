import { TurnStatus } from "../../enumeration/turn-status-enum";
import { TurnType } from "../../enumeration/turn-type-enum";
import { UnitOptionsFinalized } from "../option-context-objects";

export interface UpcomingTurn {
  gameId: number;
  turnId: number;
  gameName: string;
  turnName: string;
  turnType: TurnType;
  turnStatus: TurnStatus;
  deadline: string | Date;
}

export interface UpcomingTurnResult {
  game_id: number;
  turn_id: number;
  game_name: string;
  turn_name: string;
  turn_type: string;
  turn_status: string;
  deadline: string | Date;
}

export interface TurnOptions {
  playerId: number;
  countryId: number;
  countryName: string;
  pending?: {
    units?: UnitOptionsFinalized[]; // If (spring orders/retreats or fall orders/retreats)
    tech?: any;            // If (spring or rule override)
    buildTransfer?: any;   // If (spring or rule override)
    adjustments?: any;
    nominations?: any;
    votes?: any;
  },
  preliminary?: {
    units?: UnitOptionsFinalized[]; // If (voting and vote/spring split) or (spring retreats and not in retreat)
    buildTransfer?: any;   // If (voting and vote/spring split)
    adjustments?: any;     // If (fall retreats and not in retreat)
    nominations?: any;     // If (adjustments and adjustments/nominations split)
    tech?: any;            // If (voting and vote/spring split)
  }
}