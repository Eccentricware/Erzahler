import { createHash } from "crypto";
import { Pool, QueryResult, QueryResultRow } from "pg";
import { getUnitAdjacentInfoQuery } from "../../database/queries/options/get-unit-adjacent-info-query";
import { UnitAdjacencyInfo, UnitAdjacyInfoResult } from "../../models/objects/unit-adjacency-info-object";
import { victorCredentials } from "../../secrets/dbCredentials";

export class OptionsService {
  async saveOptionsForTurn(gameId: number, turnId: number): Promise<void> {

    const unitInfo: UnitAdjacencyInfo[] = await this.getUnitAdjacencyInfo(gameId, turnId);

    console.log('unitInfo', unitInfo);
  }

  async getUnitAdjacencyInfo(gameId: number, turnId: number): Promise<UnitAdjacencyInfo[]> {
    const pool = new Pool(victorCredentials);

    const unitAdjacencyInfoResult: UnitAdjacencyInfo[] = await pool.query(getUnitAdjacentInfoQuery, [gameId, turnId])
    .then((results: QueryResult<any>) => {
      return results.rows.map((result: UnitAdjacyInfoResult) => {
        return <UnitAdjacencyInfo>{
          unitId: result.unit_id,
          unitName: result.unit_name,
          unitType: result.unit_type,
          nodeId: result.node_id,
          nodeName: result.node_name,
          provinceId: result.province_id,
          provinceName: result.province_name,
          adjacencies: result.adjacencies.map((adjacency) => { return { nodeId: adjacency.node_id, provinceId: adjacency.province_id}}),
          holdSupports: result.hold_supports && result.hold_supports.map((unit) => { return { unitId: unit.unit_id, unitName: unit.unit_name }}),
          adjacentTransports: result.adjacent_transports && result.adjacent_transports.map((unit) => { return { unitId: unit.unit_id, unitName: unit.unit_name }}),
          adjacentTransportables: result.adjacent_transportables && result.adjacent_transportables.map((unit) => { return { unitId: unit.unit_id, unitName: unit.unit_name }}),
          transportDestinations: result.transport_destinations && result.transport_destinations.map((province) => { return { provinceId: province.province_id, provinceName: province.province_name}}),
          turnType: result.turn_type
        }
      })
    });

    return unitAdjacencyInfoResult;
  }

  async processHolds(): Promise<void> {
    // Fleets can't hold in the fall, UNLESS THEY HAVE POWER!!!
  }

  async processMovementStandard(): Promise<void> {
    // Standard is not convoyed
  }

  async processMovementConvoyed(): Promise<void> {
    // Convoyed is not standard
  }

  async saveOptionsHashes(turnId: number): Promise<void> {
    const testString1 = [[1,1,10],[2,1,2]].toString();
    console.log('testString1', createHash('sha256').update(testString1).digest('hex'));
    const testString2 = [[1,1,10],[2,1,3]].toString();
    console.log('testString2', createHash('sha256').update(testString2).digest('hex'));
  }

}