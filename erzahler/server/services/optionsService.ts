import { createHash } from "crypto";
import { Pool, QueryResult, QueryResultRow } from "pg";
import { getGameStateQuery } from "../../database/queries/options/get-game-state-query";
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

  async saveOptionsForNextTurns(gameId: number): Promise<void> {
    const gameState: GameState = await this.getGameState(gameId);
    const nextTurns: NextTurns = this.findNextTurns(gameState);

    switch(nextTurns.pending) {
      case TurnType.ORDERS_AND_VOTES:
        await this.processSpringOrdersAndVotes(gameState);
        break;
      case TurnType.SPRING_ORDERS:
        await this.processSpringOrders(gameState, false);
        break;
      case TurnType.SPRING_RETREATS:
        await this.processSpringRetreats(gameState);
        break;
      case TurnType.FALL_ORDERS:
        await this.processFallOrders(gameState, false);
        break;
      case TurnType.FALL_RETREATS:
        await this.processFallRetreats(gameState);
        break;
      case TurnType.ADJUSTMENTS:
        await this.processAdjustments(gameState, false);
        break;
      case TurnType.ADJ_AND_NOM:
        await this.processAdjustmentsAndNominations(gameState, false);
        break;
      case TurnType.NOMINATIONS:
        await this.processNominations(gameState);
        break;
      case TurnType.VOTES:
        await this.processVotes(gameState);
    }

    if (nextTurns.preliminary) {
      switch(nextTurns.preliminary) {
        case TurnType.SPRING_ORDERS:
          await this.processSpringOrders(gameState, true);
          break;
        case TurnType.FALL_ORDERS:
          await this.processFallOrders(gameState, true);
          break;
        case TurnType.ADJUSTMENTS:
          await this.processAdjustments(gameState, true);
          break;
        case TurnType.ADJ_AND_NOM:
          await this.processAdjustmentsAndNominations(gameState, true);
      }
    }

    console.log('End of save options');
  }

  async processSpringOrdersAndVotes(gameState: GameState) {
    this.processSpringUnitOrders(gameState);
  }

  async processSpringOrders(gameState: GameState, preliminary: boolean) {  // During Votes
    this.processSpringUnitOrders(gameState);
  }


  async processSpringRetreats(gameState: GameState) {}
  async processFallOrders(gameState: GameState, preliminary: boolean) {} // During Retreats
  async processFallRetreats(gameState: GameState) {}
  async processAdjustments(gameState: GameState, preliminary: boolean) {} // During Retreats
  async processAdjustmentsAndNominations(gameState: GameState, preliminary: boolean) {} // During Retreats
  async processNominations(gameState: GameState) {}
  async processVotes(gameState: GameState) {}

  async processSpringUnitOrders(gameState: GameState) {
    const sharedAdjacentProvinces: any = {};
    const unitInfo: UnitAdjacencyInfo[] = await this.getUnitAdjacencyInfo(gameState.gameId, gameState.turnId);

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

    console.log('End of processSpringUnitOrders');
  }

  findNextTurns(gameState: GameState): NextTurns {
    const nextTurns: NextTurns = { pending: '' };
    const nominationsStarted = this.checkNominationsStarted(gameState);
    const nominateDuringAdjustments = gameState.nominateDuringAdjustments;
    const voteDuringSpring = gameState.voteDuringSpring;

    // (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) ->
    if (gameState.turnType === TurnType.ORDERS_AND_VOTES) {
      if (gameState.unitsInRetreat) {
        nextTurns.pending = TurnType.SPRING_RETREATS;
        nextTurns.preliminary = TurnType.FALL_ORDERS;
      } else {
        nextTurns.pending = TurnType.FALL_ORDERS;
      }
    }

    // Spring Orders -> Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) -> Votes ->
    if (gameState.turnType === TurnType.SPRING_ORDERS) {
      if (gameState.unitsInRetreat) {
        nextTurns.pending = TurnType.SPRING_RETREATS;
        nextTurns.preliminary = TurnType.FALL_ORDERS;
      } else {
        nextTurns.pending = TurnType.FALL_ORDERS;
      }
    }

    // Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) -> (Votes -> Spring Orders) ->
    if (gameState.turnType === TurnType.SPRING_RETREATS) {
      nextTurns.pending = TurnType.FALL_ORDERS;
    }

    // Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) -> (Votes -> Spring Orders) -> Spring Retreats ->
    if (gameState.turnType === TurnType.FALL_ORDERS) {
      if (gameState.unitsInRetreat) {
        nextTurns.pending = TurnType.FALL_RETREATS;

        if (nominationsStarted && nominateDuringAdjustments) {
          nextTurns.preliminary = TurnType.ADJ_AND_NOM;
        } else  {
          nextTurns.preliminary = TurnType.ADJUSTMENTS;
        }
      } else {
        if (nominationsStarted && nominateDuringAdjustments) {
          nextTurns.pending = TurnType.ADJ_AND_NOM;
        } else  {
          nextTurns.pending = TurnType.ADJUSTMENTS;
        }
      }
    }

    // Fall Retreats -> (Adjustments -> Nominations) -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders ->
    if (gameState.turnType === TurnType.FALL_RETREATS) {
      if (nominationsStarted && nominateDuringAdjustments) {
        nextTurns.pending = TurnType.ADJ_AND_NOM;
      } else  {
        nextTurns.pending = TurnType.ADJUSTMENTS;
      }
    }

    // Adjustments -> Nominations -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats ->
    if (gameState.turnType === TurnType.ADJUSTMENTS) { // nominateDuringAdjustments === false
      if (nominationsStarted) {
        nextTurns.pending = TurnType.NOMINATIONS;
      } else {
        nextTurns.pending = TurnType.SPRING_ORDERS;
      }
    }

    // (Adjustments -> Nominations) -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats ->
    if (gameState.turnType === TurnType.ADJ_AND_NOM) {
      if (nominationsStarted && voteDuringSpring) {
        nextTurns.pending = TurnType.ORDERS_AND_VOTES;
      } else {
        nextTurns.pending = TurnType.SPRING_ORDERS;
      }
    }

    // Nominations -> (Votes -> Spring Orders) -> Spring Retreats -> Fall Orders -> Fall Retreats -> Adjustments ->
    if (gameState.turnType === TurnType.NOMINATIONS) { // nominationsStarted === true && nominateDuringAdjustments === false
      if (voteDuringSpring) {
        nextTurns.pending = TurnType.ORDERS_AND_VOTES;
      } else {
        nextTurns.pending = TurnType.SPRING_ORDERS;
      }
    }

    // Votes -> Spring Orders -> Spring Retreats -> Fall Orders -> Fall Retreats -> (Adjustments -> Nominations) ->
    if (gameState.turnType === TurnType.VOTES) {
      nextTurns.pending = TurnType.SPRING_ORDERS;
    }

    return nextTurns;
  }

  checkNominationsStarted(gameState: GameState): boolean {
    if (gameState.nominationTiming === 'set' && gameState.nominationYear) {
      if (gameState.currentYear > gameState.nominationYear) {
        return true;
      }

      if (gameState.currentYear === gameState.nominationYear) {
        const impactedTurns = [
          TurnType.FALL_RETREATS, // Next: ADJUSTMENTS or [ADJ_AND_NOM]
          TurnType.ADJUSTMENTS,   // Next: [NOMINATIONS]
          TurnType.ADJ_AND_NOM,   // Next: [VOTES] or [ORDERS_AND_VOTES]
          TurnType.NOMINATIONS   // Next: [VOTES] or [ORDERS_AND_VOTES]
        ];

        if (impactedTurns.includes(gameState.turnType)
          || (gameState.turnType === TurnType.FALL_ORDERS && !gameState.unitsInRetreat)) {
          return true;
        }
      }
    }

    return false;
  }

  async getGameState(gameId: number): Promise<any> {
    const pool = new Pool(victorCredentials);

    const gameState: GameState = await pool.query(getGameStateQuery, [gameId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((gameStateResult: GameStateResult) => {
          return <GameState> {
            gameId: gameStateResult.game_id,
            turnId: gameStateResult.turn_id,
            deadline: gameStateResult.deadline,
            turnNumber: gameStateResult.turn_number,
            turnName: gameStateResult.turn_name,
            turnType: gameStateResult.turn_type,
            turnStatus: gameStateResult.turn_status,
            resolvedTime: gameStateResult.resolved_time,
            deadlineMissed: gameStateResult.deadline_missed,
            nominateDuringAdjustments: gameStateResult.nominate_during_adjustments,
            voteDuringSpring: gameStateResult.vote_during_spring,
            nominationTiming: gameStateResult.nomination_timing,
            nominationYear: gameStateResult.nomination_year,
            currentYear: gameStateResult.current_year,
            yearNumber: gameStateResult.year_number,
            highestRankedReq: gameStateResult.highest_ranked_req,
            allVotesControlled: gameStateResult.all_votes_controlled,
            unitsInRetreat: gameStateResult.unit_in_retreat
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