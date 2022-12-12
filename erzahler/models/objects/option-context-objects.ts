import { OrderDisplay } from "../enumeration/order-display-enum";
import { UnitType } from "../enumeration/unit-enum";

export interface OrderOption {
  turnId: number;
  unitId: number;
  orderType: string;
  secondaryUnitId?: number | undefined;
  secondaryOrderType?: string;
  destinations?: number[];
}

export interface OptionsContext {
  unitInfo: UnitOptions[]
  unitIdToIndexLib: any;
  sharedAdjProvinces: any;
  potentialConvoyProvinces: any;
  validConvoyAssistProvinces: []
  transportPaths: any;
  transports: any;
  transportables: any;
  transportDestinations: any;
  turnId: number;
}

export interface UnitOptions {
  unitId: number;
  unitName: string;
  unitType: string;
  nodeId: number;
  nodeName: string;
  provinceId: number;
  provinceName: string;
  adjacencies: AdjacenctMovement[];
  moveTransported: number[];
  holdSupports: HoldSupport[];
  moveSupports: any;
  transportSupports: any;
  nukeTargets: number[];
  allTransports: any;
  adjacentTransports: AdjacentTransport[] | undefined;
  adjacentTransportables: AdjacentTransportable[] | undefined;
  transportDestinations: TransportDestination[] | undefined;
  nukeRange: number;
}

export interface AdjacenctMovement {
  nodeId: number;
  provinceId: number;
  provinceName: string;
}

export interface HoldSupport {
  unitId: number;
  unitName: string;
}

export interface MoveSupport {
  unitId: number;
  nodeId: number[];
}

interface AdjacentTransport {
  unitId: number;
  unitName: string;
}

interface AdjacentTransportable {
  unitId: number;
  unitName: string;
}

interface TransportDestination {
  nodeId: number;
  nodeName: string;
  provinceId: number;
}

export interface UnitAdjacyInfoResult {
  unit_id: number;
  unit_name: string;
  unit_type: string;
  node_id: number;
  node_name: string;
  province_id: number;
  province_name: string;
  adjacencies: AdjacenctMovementResult[];
  hold_supports: HoldSupportResult[] | undefined;
  adjacent_transports: AdjacentTransportResult[] | undefined;
  adjacent_transportables: AdjacentTransportableResult[] | undefined;
  transport_destinations: TransportDestinationResult[] | undefined;
  nuke_range: number;
}


export interface AdjacenctMovementResult {
  node_id: number;
  province_id: number;
  province_name: string;
}

interface HoldSupportResult {
  unit_id: number;
  unit_name: string;
}

interface AdjacentTransportResult {
  unit_id: number;
  unit_name: string;
}

interface AdjacentTransportableResult {
  unit_id: number;
  unit_name: string;
}

interface TransportDestinationResult {
  node_id: number;
  node_name: string;
  province_id: number;
}

export interface TransportPathLink {
  transports: number[];
  destinations: number[];
  contributions: any;
  transportOptions: number[];
  nextTransportLink: any;
}

export interface AirAdjacency {
  nodeId: number;
  provinceName: string;
  adjacencies: any[]
}

export interface SavedOptionResult {
  unit_id: number;
  unit_type: string;
  unit_country_id: string;
  unit_country_name: string;
  unit_country_rank: string;
  unit_flag_key: string;
  province_name: string;
  unit_loc: number[];
  can_hold: boolean;
  order_type: string;
  secondary_unit_id?: number;
  secondary_unit_type?: string;
  secondary_unit_country_name?: string;
  secondary_unit_flag_key?: string;
  secondary_province_name?: string;
  secondary_unit_loc?: number[];
  secondary_order_type?: string;
  destinations: DestinationResult[];
}

export interface DestinationResult {
  node_id: number;
  node_name: string;
  loc: number[]
}

export interface SavedOption {
  unitId: number;
  unitType: string;
  unitCountryId: string;
  unitCountryName: string;
  unitCountryRank: string;
  unitFlagKey: string;
  provinceName: string;
  unitLoc: number[];
  canHold: boolean;
  orderType: OrderDisplay;
  secondaryUnitId?: number;
  secondaryUnitType?: string;
  secondaryUnitCountryId?: string;
  secondaryUnitCountryName?: string;
  secondaryUnitFlagKey?: string;
  secondaryProvinceName?: string;
  secondaryUnitLoc?: number[];
  secondaryOrderType?: string;
  destinations: OptionDestination[];
}

export interface SavedDestination {
  nodeId: number;
  nodeName: string;
  loc: number[]
}

export interface UnitOptionsFinalized {
  unitId: number;
  unitType: string;
  unitDisplay: string;
  unitLoc: number[];
  orderTypes: OrderDisplay[];
  moveDestinations: OptionDestination[];
  moveTransportedDestinations: OptionDestination[];
  nukeTargets: OptionDestination[];
  supportStandardUnits: SecondaryUnit[];
  supportStandardDestinations: Record<string, OptionDestination[]>;
  supportTransportedUnits: SecondaryUnit[];
  supportTransportedDestinations: Record<string, OptionDestination[]>;
  transportableUnits: SecondaryUnit[];
  transportDestinations: Record<string, OptionDestination[]>;
}

export interface SecondaryUnit {
  id: number | undefined;
  displayName: string;
  loc: number[] | undefined;
}

export interface OptionDestination {
  nodeId: number;
  nodeName: string;
  loc: number[];
}