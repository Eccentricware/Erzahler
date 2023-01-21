export interface TerrainResult {
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