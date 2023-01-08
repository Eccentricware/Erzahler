export interface CountryStateResult {
  country_id: number;
  country_name: string;
  in_retreat: boolean;
  banked_builds: number;
  nuke_range: number | null;
  adjustments: number;
}

export interface CountryState {
  id: number;
  name: string;
  retreating: boolean;
  builds: number;
  nukeRange: number | null;
  adjustments: number;
}