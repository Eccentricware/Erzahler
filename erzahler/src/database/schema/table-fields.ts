import { CountryStatus } from "../../models/enumeration/country-enum";

export interface CountryHistoryRowResult {
  country_id: number;
  country_status: CountryStatus;
  city_count: number;
  unit_count: number;
  banked_builds: number;
  nuke_range: number;
  adjustments: number;
  in_retreat: boolean;
  vote_count: number;
  nukes_in_production: number;
}

export interface CountryHistoryRow {
  countryId: number;
  countryStatus: CountryStatus;
  cityCount: number;
  unitCount: number;
  bankedBuilds: number;
  nukeRange: number;
  adjustments: number;
  inRetreat: boolean;
  voteCount: number;
  nukesInProduction: number;
}