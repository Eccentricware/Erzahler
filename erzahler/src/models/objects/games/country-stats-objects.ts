export interface CountryStatsResult {
  country_id: number;
  country_name: string;
  rank: string;
  city_count: number;
  vote_count: number;
  nuke_range: number;
  adjustments: number;
  banked_builds: number;
}

export interface CountryStats {
  id: number;
  name: string;
  rank: string;
  cityCount: number;
  votes: number;
  bankedBuilds: number;
  nuke: number;
  adjustments: number;
}
