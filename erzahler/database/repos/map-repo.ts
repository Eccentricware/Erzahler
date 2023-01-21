import { Pool, QueryResult } from "pg";
import { IDatabase, IMain } from "pg-promise";
import { Terrain, TerrainResult } from "../../models/objects/map-objects";
import { victorCredentials } from "../../secrets/dbCredentials";
import { getTerrainQuery } from "../queries/maps/get-terrain-query";

export class MapRepository {
  pool = new Pool(victorCredentials);
  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async getTerrain(gameId: number, turnId: number): Promise<Terrain[]> {
    return await this.pool.query(getTerrainQuery, [gameId, turnId])
      .then((queryResult: QueryResult<any>) => queryResult.rows.map((result: TerrainResult) => {
        return <Terrain> {
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
        }
      }))
  }
}