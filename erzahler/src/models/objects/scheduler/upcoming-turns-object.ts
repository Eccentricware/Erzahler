import { TurnStatus } from '../../enumeration/turn-status-enum';
import { TurnType } from '../../enumeration/turn-type-enum';
import { Order, UnitOptionsFinalized } from '../option-context-objects';

export interface UpcomingTurnResult {
  game_id: number;
  turn_id: number;
  game_name: string;
  turn_name: string;
  turn_number: number;
  turn_type: TurnType;
  turn_status: string;
  year_number: number;
  year_stylized: number;
  deadline: string;
  defaults_ready: boolean;
}
export interface UpcomingTurn {
  gameId: number;
  turnId: number;
  gameName: string;
  turnName: string;
  turnNumber: number;
  turnType: TurnType;
  turnStatus: TurnStatus;
  yearNumber: number;
  yearStylized: number;
  deadline: string;
  defaultsReady: boolean;
  hasCaptures: boolean;
  unitMovement: boolean;
  transfers: boolean;
  adjustments: boolean;
}

export interface TurnOptions {
  playerId: number;
  countryId?: number;
  countryName?: string;
  pending?: SingleTurnOptions;
  preliminary?: SingleTurnOptions;
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
