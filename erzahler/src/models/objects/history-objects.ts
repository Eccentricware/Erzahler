import { OrderDisplay } from '../enumeration/order-display-enum';
import { UnitType } from '../enumeration/unit-enum';
import { Order, OrderResult } from './option-context-objects';
import { UpcomingTurn, UpcomingTurnResult } from './scheduler/upcoming-turns-object';

export interface HistoricTurnResult extends UpcomingTurnResult {
  surviving_countries: any[];
}

export interface HistoricTurn extends UpcomingTurn {
  survivingCountries: any[];
}
export interface TurnHistory {
  orderList: CountryOrders[];
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

export interface CountryOrders {
  countryName: string;
  countryFlag: string;
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