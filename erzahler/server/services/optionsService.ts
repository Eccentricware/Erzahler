import { createHash } from "crypto";
import { Pool, QueryResult, QueryResultRow } from "pg";
import { getGameStateQuery } from "../../database/queries/options/get-last-turn-info-query";
import { getUnitAdjacentInfoQuery } from "../../database/queries/options/get-unit-adjacent-info-query";
import { TurnType } from "../../models/enumeration/turn-type-enum";
import { GameState, GameStateResult, NextTurns } from "../../models/objects/last-turn-info-object";
import { AdjacenctMovement, UnitAdjacencyInfo, UnitAdjacyInfoResult } from "../../models/objects/unit-adjacency-info-object";
import { victorCredentials } from "../../secrets/dbCredentials";

export class OptionsService {
  // Turns to be processed are pending or preliminary
  // Preliminaries for Fall Orders during Spring Retreats, and Adjustments during Fall retreats
    // If Adjustment preliminary, must also account for possible nomination

  // Only one turn pending at a time
  // Adjustments/Nominations can be logically co-preliminary

  findUpcomingTurns(gameId: number) {

  }



  async saveOptionsForNextTurns(gameId: number): Promise<void> {
    const sharedAdjacentProvinces: any = {};

    const gameState: GameState = await this.getGameState(gameId);
    const nextTurns: NextTurns = this.findNextTurns(gameState);
    const unitInfo: UnitAdjacencyInfo[] = await this.getUnitAdjacencyInfo(gameId, gameState.turnId);

    unitInfo.forEach((unit: UnitAdjacencyInfo) => {
      unit.adjacencies.forEach((adjacency: AdjacenctMovement) => {
        if (sharedAdjacentProvinces[adjacency.provinceId]) {
          sharedAdjacentProvinces[adjacency.provinceId].push({
            unitId: unit.unitId,
            nodeId: adjacency.nodeId
          });
        } else {
          sharedAdjacentProvinces[adjacency.provinceId] = [{
            unitId: unit.unitId,
            nodeId: adjacency.nodeId
          }];
        }
      });
    });

    console.log('unitInfo');
  }

  findNextTurns(gameState: GameState): NextTurns {
    const nextTurns: NextTurns = { pending: TurnType.SPRING_ORDERS };

    return nextTurns;
  }

  async getGameState(gameId: number): Promise<any> {
    const pool = new Pool(victorCredentials);

    const gameState: GameState = await pool.query(getGameStateQuery, [gameId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((lastTurnResult: GameStateResult) => {
          return <GameState> {
            gameId: lastTurnResult.game_id,
            turnId: lastTurnResult.turn_id,
            deadline: lastTurnResult.deadline,
            turnNumber: lastTurnResult.turn_number,
            turnName: lastTurnResult.turn_name,
            turnType: lastTurnResult.turn_type,
            turnStatus: lastTurnResult.turn_status,
            resolvedTime: lastTurnResult.resolved_time,
            deadlineMissed: lastTurnResult.deadline_missed,
            nominateDuringAdjustments: lastTurnResult.nominate_during_adjustments,
            voteDuringSpring: lastTurnResult.vote_during_spring,
            nominationTiming: lastTurnResult.nomination_timing,
            nominationYear: lastTurnResult.nomination_year,
            currentYear: lastTurnResult.current_year,
            yearNumber: lastTurnResult.year_number
          }
        })[0];
      });

    return gameState;
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