export interface TurnOrders {
  gameId: number;
  userId: number;
  countryId: number;
  pending?: {
    orderSetId?: number;
    default?: boolean;
    restricted?: boolean;
    skipped?: boolean;
  };
  preliminary?: {
    orderSetId?: number;
    default?: number;
  }
  role?: string;
  countryName?: string;
  turnType?: string;
  message?: string;
  pendingDefault?: boolean;
  preliminaryDefault?: boolean;
  render?: string;
  units?: any[];
  buildTransfers?: TransferBuildOrder[];
  techTransfer?: TransferTechOrder;
  builds?: BuildOrders;
  disbands?: any[];
  nomination?: any;
  votes?: any[];
}

export interface SingleTurnOrders {
  units?: any[]; // If (spring orders/retreats or fall orders/retreats)
  transfers?: any[];
  builds?: any[];
  disbands?: any[];
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
export interface TransferBuildOrdersResults {
  build_transfer_recipients: TransferCountryResult[];
  build_transfer_tuples: number[];
}

export interface TransferCountryResult {
  country_id: number;
  country_name: string;
}

export interface TransferBuildOrder {
  countryId: number;
  countryName: string;
  builds: number;
}

export interface TransferTechOrderResult {
  country_id: number,
  country_name: string;
  tech_partner_id: number;
  tech_partner_name: string;
  has_nukes: boolean;
}
export interface TransferTechOrder {
  countryId: number,
  countryName: string;
  techPartnerId: number;
  techPartnerName: string;
  hasNukes: boolean;
}

export interface BuildOrdersResult {
  country_id: number;
  country_name: string;
  banked_builds: number;
  builds: number;
  nuke_range: number;
  increase_range: number;
  build_locs: BuildLocationResult[];
  build_tuples: number[];
  nuke_locs: BuildLocationResult[];
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

export interface Build {
  typeId: number;
  buildType: string;
  nodeId: number;
  nodeName: string;
  provinceName: string;
  loc: number[];
}