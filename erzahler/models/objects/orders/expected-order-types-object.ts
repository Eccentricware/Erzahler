import { TurnStatus } from "../../enumeration/turn-status-enum";
import { TurnType } from "../../enumeration/turn-type-enum";

export interface OrderTurnIds {
  votes?: number;
  units?: number;
  transfers?: number;
  retreats?: number;
  builds?: number;
  disbands?: number;
  nomination?: number;
}

export interface CountryOrderSetsResult {
  order_set_id: number;
  turn_status: TurnStatus;
  turn_type: TurnType;
  in_retreat: boolean;
  adjustments: number;
}
export interface CountryOrderSet {
  orderSetId: number;
  turnStatus: TurnStatus;
  turnType: TurnType;
  inRetreat: boolean;
  adjustments: number;
}
