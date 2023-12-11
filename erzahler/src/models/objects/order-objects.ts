import { CountryStatus } from '../enumeration/country-enum';
import { TurnStatus } from '../enumeration/turn-status-enum';
import { BuildType } from '../enumeration/unit-enum';
import { BuildLoc, NominatableCountry } from './option-context-objects';

export interface TurnOrders {
  gameId: number;
  userId: number;
  role?: string;
  countryId?: number;
  countryName?: string;
  pending?: SingleTurnOrders;
  preliminary?: SingleTurnOrders;
  message?: string;
}

export interface SingleTurnOrders {
  turnStatus: TurnStatus;
  orderSetId?: number;
  default?: boolean;
  units?: any[]; // If (spring orders/retreats or fall orders/retreats)
  techTransfers?: any[];
  buildTransfers?: any[];
  builds?: any[];
  disbands?: DisbandOrders;
  nomination?: any;
  votes?: any[];
}

export interface OrderSetFinalResult {
  order_set_id: number;
  country_id: number;
  country_name: string;
  default_orders: boolean;
  tech_partner_id: number;
  new_unit_types: string[];
  new_unit_locs: number[];
  units_disbanding: number[];
  build_transfer_recipients: any[];
  build_transfer_amounts: number[];
}

export interface OrderSetFinal {
  orderSetId: number;
  countryId: number;
  countryName: string;
  defaultOrders: boolean;
  techPartnerId: number;
  newUnitTypes: string[];
  newUnitLocs: number[];
  unitsDisbanding: number[];
  buildTransfers: TransferCountry[];
}

export interface TransferCountry {
  countryId: number;
  countryName: string;
}
export interface TransferBuildOrderResult {
  build_transfer_order_id: number;
  order_set_id: number;
  country_id: number;
  country_name: string;
  recipient_id: number;
  recipient_name: string;
  quantity: number;
  ui_row: number;
}

export interface TransferBuildOrder {
  buildTransferOrderId: number;
  orderSetId: number;
  countryId: number;
  countryName: string;
  recipientId: number;
  recipientName: string;
  quantity: number;
  uiRow: number;
}

export interface TransferCountryResult {
  country_id: number;
  country_name: string;
}

export interface TransferTechOrderResult {
  tech_transfer_order_id: number;
  order_set_id: number;
  country_id: number;
  country_name: string;
  has_nukes: boolean;
  foreign_country_id: number;
  foreign_country_name: string;
  description: string;
  resolution: string;
  success: boolean;
}
export interface TransferTechOrder {
  techTransferOrderId: number;
  orderSetId: number;
  countryId: number;
  countryName: string;
  hasNukes: boolean;
  foreignCountryId: number;
  foreignCountryName: string;
  description: string;
  resolution: string;
  success: boolean;
}

export interface BuildOrdersResult {
  country_id: number;
  country_name: string;
  banked_builds: number;
  adjustments: number;
  nuke_range: number;
  increase_range: number;
  builds: BuildResult[];
}

export interface BuildLocationResult {
  node_id: number;
  node_name: string;
  province_name: string;
  loc: number[];
}

export interface BuildOrders {
  countryId: number;
  countryName: string;
  bankedBuilds: number;
  buildCount: number;
  nukeRange: number;
  increaseRange: number;
  builds: Build[];
  nukesReady?: Build[];
}

export interface BuildResult {
  build_number: number;
  build_type: BuildType;
  node_id: number;
  node_name: string;
  province_name: string;
  loc: number[];
}

export interface Build {
  buildNumber: number;
  buildType: BuildType;
  typeId: number;
  nodeId: number;
  nodeName: string;
  provinceName: string;
  loc: number[];
}

export interface DisbandOrdersResult {
  country_id: number;
  country_name: string;
  banked_builds: number;
  disbands: number;
  unit_disbanding_detailed: DisbandingUnitDetailResult[];
  nuke_locs: number[];
  nuke_range: number;
  increase_range: number;
  units_disbanding: number[];
}
export interface DisbandOrders {
  countryId: number;
  countryName: string;
  bankedBuilds: number;
  disbands: number;
  unitDisbandingDetailed: DisbandingUnitDetail[];
  nukeLocs: number[];
  nukeBuildDetails?: NukeBuildInDisband[];
  nukeRange: number;
  increaseRange: number;
  unitsDisbanding: number[];
}

export interface NukeBuildInDisband extends BuildLoc {
  unitId: number;
}

export interface DisbandingUnitDetailResult {
  unit_id: number;
  unit_type: string;
  province_name: string;
  loc: number[];
}

export interface DisbandingUnitDetail {
  unitId: number;
  unitType: string;
  provinceName: string;
  loc: number[];
}

export interface NominationOrder {
  countryIds: number[];
  countryDetails: NominatableCountry[];
  coalitionSignature: string;
}
