import { OrderDisplay } from "../../enumeration/order-display-enum";

export interface UnitOrderResolutionResult {
  order_id: number;
  order_type: string;
  ordered_unit_id: number;
  unit_type: string;
  unit_status: string;
  country_id: number;
  country: string;
  node_id: number;
  province: string;
  secondary_unit_id: number;
  secondary_country_id: number;
  secondary_country: string;
  destination_id: number;
  valid: boolean;
  order_success: string;
  power: number;
  description: string;
  primary_resolution: string;
  secondary_resolution: string;
}

export interface UnitOrderResolution {
  orderId: number;
  orderType: OrderDisplay;
  orderedUnitId: number;
  unitType: string;
  unitStatus: string;
  unitCountryId: number;
  unitCountry: string;
  nodeId: number;
  province: string;
  secondaryUnitId: number;
  secondaryCountryId: number;
  secondaryCountry: string;
  destinationId: number;
  valid: boolean;
  orderSuccess: string;
  power: number;
  description: string;
  primaryResolution: string;
  secondaryResolution: string;
}