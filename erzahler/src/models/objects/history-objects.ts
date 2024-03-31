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
}

export interface HistoricBuildTransferOrder {
  recipientName: string;
  quantity: number;
}

interface AdjustmentDetails {
  location: string;
  description: string;
}
