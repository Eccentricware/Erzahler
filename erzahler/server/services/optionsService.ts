import { createHash } from "crypto";
import { Pool, QueryResult } from "pg";
import { getGameStateQuery } from "../../database/queries/options/get-game-state-query";
import { getUnitAdjacentInfoQuery } from "../../database/queries/options/get-unit-adjacent-info-query";
import { TurnType } from "../../models/enumeration/turn-type-enum";
import { GameState, GameStateResult, NextTurns } from "../../models/objects/last-turn-info-object";
import { AdjacenctMovement, OptionsContext, TransportPathLink, UnitAdjacyInfoResult, UnitOptions } from "../../models/objects/option-context-objects";
import { victorCredentials } from "../../secrets/dbCredentials";
import { copyObjectOfArrays, mergeArrays } from "./data-structure-service";

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
        await this.processNominations(gameState, false);
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
          break;
        case TurnType.NOMINATIONS:
          await this.processNominations(gameState, true);
      }
    }

    console.log('End of save options');
  }

  async processSpringOrdersAndVotes(gameState: GameState) {
    //Units
    this.processSpringUnitOrders(gameState);
    // Tech
    // Builds
    // Votes
  }

  async processSpringOrders(gameState: GameState, preliminary: boolean) {  // During Votes
    this.processSpringUnitOrders(gameState);
  }

  // Turn Types
  async processSpringRetreats(gameState: GameState) {}
  async processFallOrders(gameState: GameState, preliminary: boolean) {} // During Retreats
  async processFallRetreats(gameState: GameState) {}
  async processAdjustments(gameState: GameState, preliminary: boolean) {} // During Retreats
  async processAdjustmentsAndNominations(gameState: GameState, preliminary: boolean) {} // During Retreats
  async processNominations(gameState: GameState, preliminary: boolean) {} // During Adjustments
  async processVotes(gameState: GameState) {}

  // Order Types
  async processSpringUnitOrders(gameState: GameState) {
    const optionsCtx: OptionsContext = {
      unitInfo: await this.getUnitAdjacencyInfo(gameState.gameId, gameState.turnId),
      unitIdToIndexLib: {},
      sharedAdjProvinces: {},
      potentialConvoyProvinces: {},
      validConvoyAssistProvinces: [],
      transportPaths: {},
      transports: {},
      transportables: {},
      transportDestinations: {}
    };

    this.sortAdjacencyInfo(optionsCtx);
    this.processTransportPaths(optionsCtx);
    this.processMoveSupport(optionsCtx);

    console.log('End of processSpringUnitOrders');
  }

  sortAdjacencyInfo(optionsCtx: OptionsContext) {
    // Holds can be pulled at get options
    // Organizes data for all ops, but completes adjacency options
    optionsCtx.unitInfo.forEach((unit: UnitOptions, index: number) => {
      optionsCtx.unitIdToIndexLib[unit.unitId] = index;

      // Standard move support
      unit.adjacencies.forEach((adjacency: AdjacenctMovement) => {
        if (optionsCtx.sharedAdjProvinces[adjacency.provinceId]) {
          optionsCtx.sharedAdjProvinces[adjacency.provinceId].push({
            unitId: unit.unitId,
            nodeId: adjacency.nodeId,
            transported: false
          });
        } else {
          optionsCtx.sharedAdjProvinces[adjacency.provinceId] = [{
            unitId: unit.unitId,
            nodeId: adjacency.nodeId,
            transported: false
          }];
        }
      });

      // Transport Option Extraction
      if (unit.adjacentTransportables) {
        unit.adjacentTransportables.forEach((transportable: any) => {
          if (optionsCtx.transportables[transportable.unitId]) {
            optionsCtx.transportables[transportable.unitId].push(unit.unitId);
          } else {
            optionsCtx.transportables[transportable.unitId] = [unit.unitId];
          }
        });
      };

      if (unit.adjacentTransports) {
        unit.adjacentTransports.forEach((transport: any) => {
          if (optionsCtx.transports[unit.unitId]) {
            optionsCtx.transports[unit.unitId].push(transport.unitId);
          } else {
            optionsCtx.transports[unit.unitId] = [transport.unitId];
          }
        });
      };

      if (unit.transportDestinations) {
        optionsCtx.transportDestinations[unit.unitId]
          = unit.transportDestinations.map((destination: any) => {
            return destination.nodeId;
          });

        unit.transportDestinations.forEach((destination: AdjacenctMovement) => {
          if (!optionsCtx.potentialConvoyProvinces[destination.nodeId]) {
            optionsCtx.potentialConvoyProvinces[destination.nodeId] = {
              provinceId: unit.provinceId,
              nodeId: destination.nodeId
            };
          }
        });
      }
    });
  }

  processMoveSupport(optionsCtx: OptionsContext) {
    for (let province in optionsCtx.sharedAdjProvinces) {
      if (optionsCtx.sharedAdjProvinces[province].length > 1) {
        let unitsInReach: {unitId: number, nodeId: number, transported: boolean }[] = optionsCtx.sharedAdjProvinces[province];

        unitsInReach.forEach((commandedUnit: {unitId: number, nodeId: number, transported: boolean }, commandIdx: number) => {
          unitsInReach.forEach((supportedUnit: {unitId: number, nodeId: number, transported: boolean }, supportIdx: number) => {
            if (commandIdx !== supportIdx) {
              const cmdUnitDetails = this.getDetailedUnit(optionsCtx, commandedUnit.unitId);
              if (supportedUnit.transported) {
                if (cmdUnitDetails.transportSupports[supportedUnit.unitId]) {
                  cmdUnitDetails.transportSupports[supportedUnit.unitId].push(supportedUnit.nodeId);
                } else {
                  cmdUnitDetails.transportSupports[supportedUnit.unitId] = [supportedUnit.nodeId];
                }
              } else {
                if (cmdUnitDetails.moveSupports[supportedUnit.unitId]) {
                  cmdUnitDetails.moveSupports[supportedUnit.unitId].push(supportedUnit.nodeId);
                } else {
                  cmdUnitDetails.moveSupports[supportedUnit.unitId] = [supportedUnit.nodeId];
                }
              }
            }
          });
        });
      }
    }
  }

  processTransportPaths(optionsCtx: OptionsContext) {
    this. startPaths(optionsCtx);
    for (let transportedUnitId in optionsCtx.transportPaths) {
      this.extendPath(optionsCtx, optionsCtx.transportPaths[transportedUnitId], Number(transportedUnitId));
    }
  }

  startPaths(optionsCtx: OptionsContext) {
    for (let transportableId in optionsCtx.transportables) {

      let firstPathLink: TransportPathLink = {
        transports: [],
        destinations: [],
        contributions: {},
        transportOptions: optionsCtx.transports[transportableId],
        nextTransportLink: {}
      };

      optionsCtx.transportPaths[transportableId] = firstPathLink;
    }
  }

  extendPath(optionsCtx: OptionsContext, currentPathLink: TransportPathLink, transportedUnitId: number) {
    currentPathLink.transportOptions.forEach((transportId: number) => {
      const nextTransports: number[] = currentPathLink.destinations.slice();
      nextTransports.push(transportId);

      const nextDestinations: number[] = currentPathLink.destinations.slice();
      nextDestinations.push(...optionsCtx.transportDestinations[transportId]);

      let nextTransportOptions: number[] = [];
      if (optionsCtx.transports[transportId]) {
        nextTransportOptions = optionsCtx.transports[transportId].filter((optionId: number) =>
          !nextTransports.includes(optionId)
        );
      }

      const nextContributions: any = copyObjectOfArrays(currentPathLink.contributions);
      for (let transport in nextContributions) {
        nextContributions[transport].push(...optionsCtx.transportDestinations[transportId]);
      };
      nextContributions[transportId] = optionsCtx.transportDestinations[transportId].slice();

      const nextTransportLink: TransportPathLink = {
        destinations: nextDestinations,
        nextTransportLink: {},
        transportOptions: nextTransportOptions,
        transports: nextTransports,
        contributions: nextContributions
      };

      if (nextTransportOptions.length > 0) {
        currentPathLink.nextTransportLink[transportId] = nextTransportLink;
        this.extendPath(optionsCtx, currentPathLink.nextTransportLink[transportId], transportedUnitId);
      } else {
        const transportedUnit = this.getDetailedUnit(optionsCtx, transportedUnitId)
        mergeArrays(transportedUnit.moveTransported, nextDestinations);

        for (let transportId in nextContributions) {
          const transportingUnit = this.getDetailedUnit(optionsCtx, Number(transportId));

          if (transportedUnit.allTransports[transportedUnitId]) {
            mergeArrays(transportingUnit.allTransports[transportedUnitId], nextContributions[transportId]);
          } else {
            transportingUnit.allTransports[transportedUnitId] = [...nextContributions[transportId]];
          }

          this.addConvoysToSharedAdjProvinces(optionsCtx, nextContributions[transportId], transportedUnitId);
        }
      }
    });
  }

  addConvoysToSharedAdjProvinces(optionsCtx: OptionsContext, contributions: number[], transportedUnitId: number) {
    contributions.forEach((contributionId: number) => {
      const convoyProvince = optionsCtx.potentialConvoyProvinces[contributionId];
      const adjProvince = optionsCtx.sharedAdjProvinces[convoyProvince.provinceId];

      const doesNotHaveUnit = adjProvince.filter((adjProvince: any) =>
        adjProvince.unitId === transportedUnitId
      ).length === 0;

      if (doesNotHaveUnit) {
        optionsCtx.sharedAdjProvinces[convoyProvince.provinceId].push({
          nodeId: contributionId,
          unitId: transportedUnitId,
          transported: true
        });
      }
    });

    console.log('And here we go');
  }

  getDetailedUnit(optionsCtx: OptionsContext, unitId: number): UnitOptions {
    return optionsCtx.unitInfo[optionsCtx.unitIdToIndexLib[unitId]];
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
      } else if (nominationsStarted && !nominateDuringAdjustments) {
        nextTurns.pending = TurnType.ADJUSTMENTS;
        nextTurns.preliminary = TurnType.NOMINATIONS;
      } else {
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
        nextTurns.pending = TurnType.VOTES;
        nextTurns.preliminary = TurnType.SPRING_ORDERS;
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

  async getUnitAdjacencyInfo(gameId: number, turnId: number): Promise<UnitOptions[]> {
    const pool = new Pool(victorCredentials);

    const unitAdjacencyInfoResult: UnitOptions[] = await pool.query(getUnitAdjacentInfoQuery, [gameId, turnId])
    .then((results: QueryResult<any>) => {
      return results.rows.map((result: UnitAdjacyInfoResult) => {
        return <UnitOptions>{
          unitId: result.unit_id,
          unitName: result.unit_name,
          unitType: result.unit_type,
          nodeId: result.node_id,
          nodeName: result.node_name,
          provinceId: result.province_id,
          provinceName: result.province_name,
          adjacencies: result.adjacencies.map((adjacency) => { return { nodeId: adjacency.node_id, provinceId: adjacency.province_id}}),
          moveTransported: [],
          holdSupports: result.hold_supports && result.hold_supports.map((unit) => { return { unitId: unit.unit_id, unitName: unit.unit_name }}),
          moveSupports: {},
          transportSupports: {},
          adjacentTransports: result.adjacent_transports && result.adjacent_transports.map((unit) => { return { unitId: unit.unit_id, unitName: unit.unit_name }}),
          allTransports: {},
          adjacentTransportables: result.adjacent_transportables && result.adjacent_transportables.map((unit) => { return { unitId: unit.unit_id, unitName: unit.unit_name }}),
          transportDestinations: result.transport_destinations && result.transport_destinations.map((destination) => {
            return {
              nodeId: destination.node_id,
              nodeName: destination.node_name,
              provinceId: destination.province_id
            }
          })
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