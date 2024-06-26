import { TurnStatus } from '../../enumeration/turn-status-enum';
import { TurnType } from '../../enumeration/turn-type-enum';

export interface OrderTurnIds {
  core?: number;
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

export interface CountryOrderSetIdsResults {
  country_id: number;
  pending_order_set_id: number;
  preliminary_order_set_id: number;
}

export interface CountryOrderSetIds {
  countryId: number;
  pendingOrderSetId: number | undefined;
  preliminaryOrderSetId: number | undefined;
}

export interface CountryAuthorizationResult {
  assigned: boolean;
  pending_order_set_id: number | undefined;
  preliminary_order_set_id: number | undefined;
}

export interface CountryAuthorization {
  assigned: boolean;
  pendingOrderSetId: number | undefined;
  preliminaryOrderSetId: number | undefined;
}
