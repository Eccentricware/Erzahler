import { OrderDisplay } from '../enumeration/order-display-enum';
import { BuildType, UnitType } from '../enumeration/unit-enum';
import { Order, OrderResult } from './option-context-objects';
import { UpcomingTurn, UpcomingTurnResult } from './scheduler/upcoming-turns-object';

export interface HistoricTurnResult extends UpcomingTurnResult {
  historic_countries: HistoricCountryOrdersResult[];
}

export interface HistoricTurn extends UpcomingTurn {
  historicCountries: HistoricCountryOrders[];
}

export interface HistoricCountryOrdersResult {
  country_id: number;
  country_name: string;
  rank: string;
  flag_key: string;
  username: string;
  city_count_start: number;
  city_count_result: number;
  unit_count_start: number;
  unit_count_result: number;
  vote_count_start: number;
  vote_count_result: number;
  banked_builds_start: number;
  banked_builds_result: number;
  nuke_range_start: number;
  nuke_range_result: number;
  adjustments_start: number;
  adjustments_result: number;
  tech_partner_name: number;
  vote_orders: number[];
  increase_range_orders: number;
}
export interface HistoricCountry {
  countryId: number;
  countryName: string;
  rank: string;
  flagKey: string;
  username: string;
  history: {
    start: {
      cityCount: number;
      unitCount: number;
      adjustments: number;
      voteCount: number;
      bankedBuilds: number;
      nukeRange: number;
    };
    result: {
      cityCount: number;
      unitCount: number;
      adjustments: number;
      voteCount: number;
      bankedBuilds: number;
      nukeRange: number;
    };
  }
  orders: {
    techPartnerName: number;
    votes: number[];
    increaseRange: number;
  };
}
export interface TurnHistory {
  orderList: HistoricCountryOrders[];
  maps: {
    orders: {
      nuclear: any;
      standard: any;
    };
    renderData: {
      start: any;
      result: any;
    };
  };
}

export interface HistoricCountryOrders {
  countryId: number;
  countryName: string;
  rank: string;
  flagKey: string;
  history: {
    start: {
      cityCount: number;
      unitCount: number;
      voteCount: number;
      bankedBuilds: number;
      nukeRange: number;
      adjustments: number;
    };
    result: {
      cityCount: number;
      unitCount: number;
      voteCount: number;
      bankedBuilds: number;
      nukeRange: number;
      adjustments: number;
    };
  };
  orders: {
    trades: {
      tech: string | undefined;
      builds: HistoricBuildTransferOrder[];
    };
    units: HistoricOrderDisplay[];
    adjustments: AdjustmentDetails[];
    buildsBanked: number;
    buildsStartingNukes: number;
    buildsIncreasingRange: number;
    bankedBuildsIncreasingRange: number;
  };
}

export interface HistoricOrderResult extends OrderResult {
  country_id: number;
  unit_type: UnitType;
  origin_province_name: string;
  destination_province_name: string;
  secondary_unit_type: UnitType;
  secondary_province_name: string;
  primary_resolution: string;
  secondary_resolution: string;
  secondary_unit_order_type: OrderDisplay;
}

export interface HistoricOrder extends Order {
  countryId: number;
  unitType: UnitType;
  originProvinceName: string;
  destinationProvinceName: string;
  secondaryUnitType: UnitType;
  secondaryProvinceName: string;
  primaryResolution: string;
  secondaryResolution: string;
  secondaryUnitOrderType: OrderDisplay;
}

export interface HistoricOrderDisplay {
  originProvince: string;
  description: string;
  primaryResolution: string;
  secondaryResolution: string;
  success: boolean;
  secondarySuccess: boolean;
  orderType: OrderDisplay;
  loc: number[];
  eventLoc: number[];
  secondaryLoc: number[];
}

export interface HistoricBuildTransferOrder {
  recipientName: string;
  quantity: number;
}

interface AdjustmentDetails {
  location: string;
  loc: number[];
  description: string;
}

export interface HistoricNominationResult {
  nomination_id: number;
  countries: HistoricNominatedCountryResult[];
  signature: string;
  votes_required: number;
}

export interface HistoricNomination {
  nominationId: number;
  countries: HistoricNominatedCountry[];
  signature: string;
  votesRequired: number;
}

export interface HistoricNominatedCountryResult {
  country_id: number;
  country_name: string;
  rank: string;
}

export interface HistoricNominatedCountry {
  countryId: number;
  countryName: string;
  rank: string;
}

export interface HistoricNominationVoteResult {
  countries: HistoricNominatedCountryResult[];
  nomination_id: number;
  signature: string;
  votes_required: number;
  votes_received: number;
  winner: boolean;
  yay_votes: HistoricYayVoteResult[];
}

export interface HistoricNominationVote {
  countries: HistoricNominatedCountry[];
  nominationId: number;
  signature: string;
  votesRequired: number;
  votesReceived: number;
  winner: boolean;
  yayVotes: HistoricYayVote[];
}

export interface HistoricYayVoteResult {
  country_id: number;
  country_name: string;
  votes_controlled: number;
}

export interface HistoricYayVote {
  countryId: number;
  countryName: string;
  votesControlled: number;
}

export interface HistoricBuildOrdersResult {
  country_id: number;
  country_name: string;
  banked_builds: number;
  adjustments: number;
  nuke_range: number;
  increase_range: number;
  builds: HistoricBuildResult[];
}

export interface HistoricBuildOrders {
  countryId: number;
  countryName: string;
  bankedBuilds: number;
  adjustmentCount: number;
  nukeRange: number | null;
  increaseRange: number;
  builds: HistoricBuild[];
  nukesReady?: HistoricBuild[];
}

export interface HistoricBuildResult {
  build_order_id?: number;
  order_set_id: number;
  build_number: number;
  build_type: BuildType;
  node_id: number;
  node_name?: string;
  node_display?: string;
  province_name?: string;
  loc?: number[];
}

export interface HistoricBuild {
  buildOrderId?: number;
  orderSetId: number;
  buildNumber: number;
  buildType: BuildType;
  typeId: number;
  nodeId: number;
  nodeName?: string;
  nodeDisplay?: string;
  provinceName?: string;
  loc?: number[];
}