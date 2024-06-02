import { Pool, QueryResult } from 'pg';
import { IDatabase, IMain, queryResult } from 'pg-promise';
import {
  City,
  CityResult,
  Label,
  LabelLine,
  LabelLineResult,
  LabelResult,
  Terrain,
  TerrainResult,
  Unit,
  UnitResult
} from '../../models/objects/map-objects';
import { envCredentials } from '../../secrets/dbCredentials';
import { getCitiesQuery } from '../queries/maps/get-current-cities-query';
import { getLabelLinesQuery } from '../queries/maps/get-label-lines-query';
import { getLabelsQuery } from '../queries/maps/get-labels-query';
import { getTerrainQuery } from '../queries/maps/get-current-terrain-query';
import { getUnitsQuery } from '../queries/maps/get-current-units-query';

export class MapRepository {
  pool = new Pool(envCredentials);
  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async getTerrain(gameId: number, turnId: number): Promise<Terrain[]> {
    return await this.pool.query(getTerrainQuery, [gameId, turnId]).then((queryResult: QueryResult<any>) =>
      queryResult.rows.map((result: TerrainResult) => {
        return <Terrain>{
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
      })
    );
  }

  async getCities(gameId: number, turnNumber: number): Promise<City[]> {
    return await this.pool.query(getCitiesQuery, [gameId, turnNumber]).then((queryResult: QueryResult<any>) =>
      queryResult.rows.map((result: CityResult) => {
        return <City>{
          provinceId: result.province_id,
          name: result.province_name,
          type: result.city_type,
          controllerId: result.controller_id,
          capitalOwnerId: result.capital_owner_id,
          capitalOwnerStatus: result.capital_owner_status,
          loc: result.city_loc,
          status: result.province_status
        };
      })
    );
  }

  async getLabels(gameId: number): Promise<Label[]> {
    return await this.pool.query(getLabelsQuery, [gameId]).then((queryResult: QueryResult<any>) =>
      queryResult.rows.map((result: LabelResult) => {
        return <Label>{
          name: result.label_name,
          province: result.province_name,
          text: result.label_text,
          type: result.label_type,
          loc: result.loc,
          fill: result.fill
        };
      })
    );
  }

  async getLabelLines(gameId: number): Promise<LabelLine[]> {
    return await this.pool.query(getLabelLinesQuery, [gameId]).then((queryResult: QueryResult<any>) =>
      queryResult.rows.map((result: LabelLineResult) => {
        return <LabelLine>{
          name: result.label_line_name,
          x1: result.x1,
          x2: result.x2,
          y1: result.y1,
          y2: result.y2,
          stroke: result.stroke
        };
      })
    );
  }

  async getUnits(gameId: number, turnNumber: number): Promise<Unit[]> {
    return await this.pool.query(getUnitsQuery, [gameId, turnNumber]).then((queryResult: QueryResult<any>) =>
      queryResult.rows.map((result: UnitResult) => {
        return <Unit>{
          name: result.unit_name,
          type: result.unit_type,
          loc: result.loc,
          nodeId: result.node_id,
          countryKey: result.flag_key,
          status: result.unit_status,
          eventLoc: result.event_loc,
          falloutEndTurn: result.fallout_end_turn
        };
      })
    );
  }
}
