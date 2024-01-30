import { ProvinceHistoryRow } from '../../../database/schema/table-fields';
import { OrderDisplay } from '../../enumeration/order-display-enum';
import { ProvinceStatus, ProvinceType, ResolutionEvent, CityType } from '../../enumeration/province-enums';
import { UnitStatus, UnitType } from '../../enumeration/unit-enum';
import {
  AdjacentTransportResult,
  AdjacentTransportableResult,
  TransportDestinationResult,
  AdjacentTransport,
  AdjacentTransportable,
  TransportDestination
} from '../option-context-objects';
import { TransferBuildOrder, TransferTechOrder } from '../order-objects';

export interface UnitOrderResolutionResult {
  order_id: number;
  order_set_id: number;
  order_type: string;
  ordered_unit_id: number;
  valid: boolean;
  // order_success: boolean;
  // power: number;
  // description: string;
  // primary_resolution: string;
  // secondary_resolution: string;
  unit_type: UnitType;
  unit_status: string;
  country_id: number;
  country: string;
  node_id: number;
  province_id: number;
  province: string;
  province_type: string;
  event_node_id: number;
  city_type: string;
  province_status: string;
  controller_id: number;
  capital_owner_id: number;
  secondary_unit_id: number;
  secondary_unit_type: UnitType;
  secondary_unit_status: UnitStatus;
  secondary_country_id: number;
  secondary_country: string;
  secondary_unit_province: string;
  secondary_unit_order_type: string;
  destination_id: number;
  destination_display: string;
  destination_node_type: string;
  destination_province_id: number;
  destination_province_name: string;
  destination_province_status: string;
  destination_province_type: string;
  destination_city_type: string;
  destination_controller_id: number;
  destination_capital_owner_id: number;
}

export interface UnitOrderResolution {
  orderId: number;
  orderSetId: number;
  orderType: OrderDisplay;
  valid: boolean;
  orderSuccess: boolean;
  supportCut?: boolean;
  power: number;
  description: string;
  primaryResolution: string;
  secondaryResolution: string;
  unit: {
    id: number;
    type: UnitType;
    status: UnitStatus;
    countryId: number;
    countryName: string;
    canCapture: boolean;
  };
  origin: OrderResolutionLocation;
  secondaryUnit: {
    id: number;
    type: UnitType;
    status: UnitStatus;
    countryId: number;
    country: string;
    provinceName: string;
    orderType: OrderDisplay;
    canCapture: boolean;
  };
  destination: OrderResolutionLocation;
  displacerProvinceId?: number;
}

export interface OrderResolutionLocation {
  nodeId: number;
  provinceId: number;
  provinceName: string;
  display: string;
  provinceType: ProvinceType;
  cityType: CityType;
  provinceStatus: ProvinceStatus;
  controllerId: number;
  capitalOwnerId: number;
  contested?: boolean;
  validRetreat: boolean;
  statusColor?: string;
  strokeColor?: string;
}

export interface UnitOrderGroups {
  transport: UnitOrderResolution[];
  hold: UnitOrderResolution[];
  disband?: UnitOrderResolution[];
  invalid: UnitOrderResolution[];
  move: UnitOrderResolution[];
  moveTransported: UnitOrderResolution[];
  nuke: UnitOrderResolution[];
  support: UnitOrderResolution[];
}

export interface ProvinceEvents {
  contested: number[];
  nuked: number[];
}

export interface TransportNetworkUnitResult {
  unit_id: number;
  adjacent_transportables: AdjacentTransportableResult[];
  adjacent_transports: AdjacentTransportResult[];
  transport_destinations: TransportDestinationResult[];
}
export interface TransportNetworkUnit {
  unitId: number;
  transportables: AdjacentTransportable[];
  transports: AdjacentTransport[];
  destinations: TransportDestination[];
}

export interface CompliantTransportPath {
  transportsCommitted: number[];
  transportOptions: number[];
  nextTransportLink: any;
}

export interface TransportAttempt {
  success: boolean;
  paths: AttemptedPath[];
}

export interface AttemptedPath {
  transports: number[];
  success: boolean;
}

export interface OrderDependencies {
  dependency: Record<
    number,
    {
      orderId: number;
      description: string;
    }
  >;
  heads: number[];
}

export interface OrderSupremacy {
  supremeOrder: UnitOrderResolution;
  secondaryOrderId: UnitOrderResolution;
  description: string;
}

export interface TransferResourcesResults {
  country_id: number;
  country_name: string;
  banked_builds: number;
  nuke_range: number;
}

export interface CountryTransferResources {
  countryId: number;
  countryName: string;
  bankedBuilds: number;
  buildsRemaining: number;
  nukeRange: number;
}

export interface TransferResources {
  countryResources: CountryTransferResources[];
  handshakes: {
    offers: Record<number, number>;
    requests: Record<number, number>;
  };
  techTransferResults?: TransferTechOrder[];
  buildTransferResults?: TransferBuildOrder[];
}

export interface UnitMovementResults {
  orderResults: UnitOrderResolution[];
  contestedProvinces: ProvinceHistoryRow[];
}
