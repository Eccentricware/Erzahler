import { CountryStatus } from "../enumeration/country-enum";
import { CityType } from "../enumeration/province-enums";

export interface TerrainResult {
  province_name: string;
  render_category: string;
  terrain_type: string;
  top_bound: number;
  left_bound: number;
  right_bound: number;
  bottom_bound: number;
  color: string;
  points: string;
}

export interface Terrain {
  province: string;
  renderCategory: string;
  type: string;
  fill: string;
  points: string;
  bounds: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}

export interface CityResult {
  province_id: number;
  province_name: string;
  city_type: CityType;
  province_status: string;
  controller_id: number;
  capital_owner_id: number;
  capital_owner_status: CountryStatus;
  city_loc: number[];
}

export interface City {
  provinceId: number;
  name: string;
  type: CityType;
  status: string;
  controllerId: number;
  capitalOwnerId: number;
  capitalOwnerStatus: CountryStatus;
  loc: number[];
}

export interface LabelResult {
  label_name: string;
  label_type: string;
  loc: number[];
  label_text: string;
  fill: string;
  province_name: string;
}
export interface Label {
  name: string;
  type: string;
  loc: number[];
  text: string;
  fill: string;
  province: string;
}

export interface LabelLineResult {
  label_line_name: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  stroke: string;
}
export interface LabelLine {
  name: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  stroke: string;
}

export interface UnitResult {
  unit_name: string;
  unit_type: string;
  loc: number[];
  flag_key: string;
  unit_status: string;
  event_loc: number[];
}
export interface Unit {
  name: string;
  type: string;
  loc: number[];
  countryKey: string;
  status: string;
  eventLoc: number[];
}
