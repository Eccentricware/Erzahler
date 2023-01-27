import { Pool, QueryResult } from "pg";
import { IDatabase, IMain, queryResult } from "pg-promise";
import { City, CityResult, Label, LabelResult, Terrain, TerrainResult } from "../../models/objects/map-objects";
import { victorCredentials } from "../../secrets/dbCredentials";
import { getCitiesQuery } from "../queries/maps/get-cities-query";
import { getLabelsQuery } from "../queries/maps/get-labels-query";
import { getTerrainQuery } from "../queries/maps/get-terrain-query";

export class MapRepository {
  pool = new Pool(victorCredentials);
  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async getTerrain(gameId: number, turnId: number): Promise<Terrain[]> {
    return await this.pool.query(getTerrainQuery, [gameId, turnId])
      .then((queryResult: QueryResult<any>) => queryResult.rows.map((result: TerrainResult) => {
        return <Terrain> {
          province: result.province_name,
          renderCategory: result.render_category,
          type: result.terrain_type,
          fill: result.color,
          points: result.points,
          bounds: {
            top: result.top_bound,
            left: result.left_bound,
            right: result.right_bound,
            bottom: result.bottom_bound
          }
        };
      }));
  }

  async getCities(gameId: number, turnId: number): Promise<City[]> {
    return await this.pool.query(getCitiesQuery, [gameId, turnId])
      .then((queryResult: QueryResult<any>) => queryResult.rows.map((result: CityResult) => {
        return <City> {
          loc: result.city_loc,
          type: result.vote_type,
          voteColor: result.vote_color,
          statusColor: result.status_color,
          strokeColor: result.stroke_color,
          name: result.province_name
        };
      }));
  }

  async getLabels(gameId: number): Promise<Label[]> {
    return await this.pool.query(getLabelsQuery, [gameId])
      .then((queryResult: QueryResult<any>) => queryResult.rows.map((result: LabelResult) => {
        return <Label> {
          name: result.label_name,
          province: result.province_name,
          text: result.label_text,
          type: result.label_type,
          loc: result.loc,
          fill: result.fill
        }
      }));
  }
}