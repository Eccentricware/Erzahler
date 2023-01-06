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
  }
}

export interface CityResult {
  vote_type: string;
  city_loc: number[];
  vote_color: string;
  status_color: string;
  stroke_color: string;
  province_name: string;
  province_status: string;
}
export interface City {
  type: string;
  loc: number[];
  voteColor: string;
  statusColor: string;
  strokeColor: string;
  name: string;
  status: string;
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