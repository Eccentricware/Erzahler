import { Pool, QueryResult } from "pg";
import { getGameStateQuery } from "../../database/queries/options/get-game-state-query";
import { getAirAdjQuery } from "../../database/queries/options/get-air-adj-query";
import { GameState, GameStateResult, NextTurns } from "../../models/objects/last-turn-info-object";
import { AdjacenctMovement, AdjacenctMovementResult, AirAdjacency, HoldSupport, OptionDestination, OptionsContext, OrderOption, SavedDestination, SavedOption, SecondaryUnit, TransportPathLink, UnitAdjacyInfoResult, UnitOptionsFinalized, UnitOptions, TransferOption, BuildLoc, AtRiskUnit, NominatableCountry, Nomination, OrderPrepping, OrderSet, Order } from "../../models/objects/option-context-objects";
import { victorCredentials } from "../../secrets/dbCredentials";
import { copyObjectOfArrays, mergeArrays } from "./data-structure-service";
import { UnitType } from "../../models/enumeration/unit-enum";
import { db } from "../../database/connection";
import { OrderDisplay } from "../../models/enumeration/order-display-enum";
import { AccountService } from "./accountService";
import { AssignmentService } from "./assignmentService";
import { SchedulerService } from "./scheduler-service";
import { TurnOptions, UpcomingTurn } from "../../models/objects/scheduler/upcoming-turns-object";
import { TurnType } from "../../models/enumeration/turn-type-enum";
import { assert } from "console";
import { stringify } from "querystring";
import { TurnStatus } from "../../models/enumeration/turn-status-enum";

export class OptionsService {

  // Turns to be processed are pending or preliminary
  // Preliminaries for Fall Orders during Spring Retreats, and Adjustments during Fall retreats
    // If Adjustment preliminary, must also account for possible nomination

  // Only one turn pending at a time
  // Adjustments/Nominations can be logically co-preliminary

  async saveOptionsForNextTurn(gameId: number, turnId?: number): Promise<void> {
    const gameState: GameState = await db.gameRepo.getGameState(gameId);

    const optionsContext: OptionsContext = await this.processUnitOrderOptions(gameState);

    await this.saveUnitOrderOptions(
      optionsContext,
      turnId ? turnId : optionsContext.turnId
    );
  }

  async processUnitOrderOptions(gameState: GameState): Promise<OptionsContext> {
    const unitInfo: UnitOptions[] = await this.getUnitAdjacencyInfo(gameState.gameId, gameState.turnId);

    const optionsCtx: OptionsContext = {
      gameId: gameState.gameId,
      unitInfo: unitInfo,
      unitIdToIndexLib: {},
      sharedAdjProvinces: {},
      potentialConvoyProvinces: {},
      validConvoyAssistProvinces: [],
      transportPaths: {},
      transports: {},
      transportables: {},
      transportDestinations: {},
      turnId: gameState.turnId
    };

    this.sortAdjacencyInfo(optionsCtx);
    this.processTransportPaths(optionsCtx);
    this.processMoveSupport(optionsCtx);
    this.processNukeOptions(gameState, optionsCtx);

    return optionsCtx;
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

        unit.transportDestinations.forEach((destination: any) => {
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
  }

  getDetailedUnit(optionsCtx: OptionsContext, unitId: number): UnitOptions {
    return optionsCtx.unitInfo[optionsCtx.unitIdToIndexLib[unitId]];
  }

  async getUnitAdjacencyInfo(gameId: number, turnId: number): Promise<UnitOptions[]> {
    const unitOtions: UnitOptions[] = await db.optionsRepo.getUnitAdjacencyInfo(gameId, turnId);

    return unitOtions;
  }

  async processNukeOptions(gameState: GameState, optionsCtx: OptionsContext): Promise<void> {
    const airAdjArray: AirAdjacency[] = await db.optionsRepo.getAirAdjacencies(gameState.gameId);
    const nukeTargetLib: any = {};
    const unlimitedRangeTargets: number[] = [];

    airAdjArray.forEach((nukeTarget: AirAdjacency, index: number) => {
      nukeTargetLib[nukeTarget.provinceName] = index;
      unlimitedRangeTargets.push(nukeTarget.nodeId);
    });

    optionsCtx.unitInfo.filter((unit: UnitOptions) => unit.unitType === UnitType.NUKE)
      .forEach((unit: UnitOptions) => {
        if (unit.nukeRange === 0) {
          unit.nukeTargets = unlimitedRangeTargets;
        } else if (unit.nukeRange) {
          unit.nukeTargets = this.processLimitedNukeTargets(airAdjArray, nukeTargetLib, unit);
        }
      });
  }

  processLimitedNukeTargets(airAdjArray: AirAdjacency[], nukeTargetLib: any, unit: UnitOptions): number[] {
    const nukeTargets: string[] =
      airAdjArray[nukeTargetLib[unit.provinceName]].adjacencies
        .map((target: AdjacenctMovement) => {
          return target.provinceName
        });

    let rangeProcessed = 1;
    while (rangeProcessed < unit.nukeRange && nukeTargets.length < airAdjArray.length) {
      let targetsToAdd: string[] = [];
      nukeTargets.forEach((target: string) => {
        mergeArrays(
          targetsToAdd,
          airAdjArray[nukeTargetLib[target]].adjacencies.map((target: AdjacenctMovement) => target.provinceName)
        );
      });
      mergeArrays(nukeTargets, targetsToAdd);
      rangeProcessed++;
    }

    return nukeTargets.map((target: string) => {
      return airAdjArray[nukeTargetLib[target]].nodeId
    });
  }

  /**
   * Takes a finalized OptionsContext and assigned it to the provided turnId
   *
   * @param optionsContext
   * @param turnId
   */
  async saveUnitOrderOptions(optionsContext: OptionsContext, turnId: number): Promise<any> {
    const orderOptions: OrderOption[] = [];

    optionsContext.unitInfo.forEach((unit: UnitOptions) => {
      if (unit.adjacencies.length > 0) {
        orderOptions.push(this.formatStandardMovement(unit, optionsContext.turnId));
      }

      if (unit.moveTransported.length > 0) {
        orderOptions.push(this.formatTransportedMovement(unit, optionsContext.turnId));
      }

      if (unit.holdSupports && unit.holdSupports.length > 0) {
        orderOptions.push(...this.formatSupportHold(unit, optionsContext.turnId));
      }

      if (Object.keys(unit.moveSupports).length > 0) {
        orderOptions.push(...this.formatSupportMoveStandard(unit, optionsContext.turnId));
      }

      if (Object.keys(unit.transportSupports).length > 0) {
        orderOptions.push(...this.formatSupportMoveTransported(unit, optionsContext.turnId));
      }

      if (Object.keys(unit.allTransports).length > 0) {
        orderOptions.push(...this.formatTransport(unit, optionsContext.turnId));
      }

      if (unit.nukeTargets.length > 0) {
        orderOptions.push(this.formatNuke(unit, optionsContext.turnId));
      }
    });

    if (orderOptions.length > 0) {
      // await db.optionsRepo.saveOrderOptions(orderOptions, turnId);
      this.saveDefaultOrders(optionsContext.gameId);
    }
  }

  formatStandardMovement(unit: UnitOptions, turnId: number): OrderOption {
    const stdMovementDestinations: number[] = unit.adjacencies.map((adjacency: AdjacenctMovement) => adjacency.nodeId);
    const stdMovementOptions: OrderOption = {
      unitId: unit.unitId,
      orderType: OrderDisplay.MOVE,
      secondaryUnitId: undefined,
      destinations: stdMovementDestinations,
      turnId: turnId
    }

    return stdMovementOptions;
  }

  formatTransportedMovement(unit: UnitOptions, turnId: number): OrderOption {
    return {
      unitId: unit.unitId,
      orderType: OrderDisplay.MOVE_CONVOYED,
      destinations: unit.moveTransported,
      turnId: turnId
    };
  }

  formatSupportHold(unit: UnitOptions, turnId: number): OrderOption[] {
    let holdSupportOptions: OrderOption[] = [];
    if (unit.holdSupports) {
      holdSupportOptions = unit.holdSupports.map((secondaryUnit: HoldSupport) => {
        return {
          unitId: unit.unitId,
          orderType: OrderDisplay.SUPPORT,
          secondaryUnitId: secondaryUnit.unitId,
          secondaryOrderType: OrderDisplay.HOLD,
          turnId: turnId
        }
      });
    }
    return holdSupportOptions;
  }

  formatSupportMoveStandard(unit: UnitOptions, turnId: number): OrderOption[] {
    const moveSupports: OrderOption[] = [];

    for (let supportedId in unit.moveSupports) {
      moveSupports.push({
        unitId: unit.unitId,
        orderType: OrderDisplay.SUPPORT,
        secondaryUnitId: Number(supportedId),
        secondaryOrderType: OrderDisplay.MOVE,
        destinations: unit.moveSupports[supportedId],
        turnId: turnId
      });
    }

    return moveSupports;
  }

  formatSupportMoveTransported(unit: UnitOptions, turnId: number): OrderOption[] {
    const moveConvoyedSupport: OrderOption[] = [];

    for (let supportedId in unit.transportSupports) {
      moveConvoyedSupport.push({
        unitId: unit.unitId,
        orderType: OrderDisplay.SUPPORT_CONVOYED,
        secondaryUnitId: Number(supportedId),
        secondaryOrderType: OrderDisplay.MOVE_CONVOYED,
        destinations: unit.transportSupports[supportedId],
        turnId: turnId
      });
    }

    return moveConvoyedSupport;
  }

  formatTransport(unit: UnitOptions, turnId: number): OrderOption[] {
    const transportOptions: OrderOption[] = [];

    for (let transportedId in unit.allTransports) {
      transportOptions.push({
        unitId: unit.unitId,
        orderType: unit.unitType === UnitType.FLEET ? OrderDisplay.CONVOY : OrderDisplay.AIRLIFT,
        secondaryUnitId: Number(transportedId),
        secondaryOrderType: OrderDisplay.MOVE,
        destinations: unit.allTransports[transportedId],
        turnId: turnId
      });
    }

    return transportOptions;
  }

  formatNuke(unit: UnitOptions, turnId: number): OrderOption {
    return {
      unitId: unit.unitId,
      orderType: OrderDisplay.DETONATE,
      destinations: unit.nukeTargets,
      turnId: turnId
    }
  }

  async saveDefaultOrders(gameId: number): Promise<void> {
    const gameState = await db.gameRepo.getGameState(gameId);

    const upcomingTurns: UpcomingTurn[] = await db.schedulerRepo.getUpcomingTurns(gameId);

    let pendingTurn: UpcomingTurn | undefined = upcomingTurns.filter((turn: UpcomingTurn) =>
      turn.turnStatus === TurnStatus.PENDING
    )[0];
    const pendingTurnId = pendingTurn.turnId;

    let preliminaryTurn: UpcomingTurn | undefined = upcomingTurns.filter((turn: UpcomingTurn) =>
      turn.turnStatus === TurnStatus.PRELIMINARY
    )[0];

    if (pendingTurn && !pendingTurn.defaultsReady) {
      this.saveTurnDefaults(pendingTurn, gameState.turnId);
    }

    if (preliminaryTurn && !preliminaryTurn.defaultsReady) {
      this.saveTurnDefaults(preliminaryTurn, gameState.turnId);
    }
  }

  async saveTurnDefaults(upcomingTurn: UpcomingTurn, currentTurnId: number): Promise<void> {
    const orderSetLibrary: Record<string, number> = {};
      const newOrderSets = await db.optionsRepo.insertTurnOrderSets(currentTurnId, upcomingTurn.turnId);
      newOrderSets.forEach((orderSet: OrderSet) => orderSetLibrary[orderSet.countryId] = orderSet.orderSetId);
      const unitOptions: SavedOption[] = await db.optionsRepo.getUnitOptions(currentTurnId, upcomingTurn.turnId);
      const preppedOrderLibrary: Record<string, OrderPrepping> = {};
      const defaultOrders: Order[] = [];

      if([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(upcomingTurn.turnType)) {
        unitOptions.forEach((option: SavedOption) => {
          if (!preppedOrderLibrary[option.unitId]) {
            preppedOrderLibrary[option.unitId] = {
              unitId: option.unitId,
              orderType: OrderDisplay.HOLD,
              destinationId: undefined,
              countryId: Number(option.unitCountryId)
            }
          }
        });

      } else if (upcomingTurn.turnType === TurnType.FALL_ORDERS) {
        unitOptions.forEach((option: SavedOption) => {
          if (!preppedOrderLibrary[option.unitId]) {
            if (option.canHold) {
              preppedOrderLibrary[option.unitId] = {
                unitId: option.unitId,
                orderType: OrderDisplay.HOLD,
                destinationId: undefined,
                countryId: Number(option.unitCountryId)
              }
            } else if (option.orderType === OrderDisplay.MOVE) {
              preppedOrderLibrary[option.unitId] =  {
                unitId: option.unitId,
                orderType: OrderDisplay.MOVE,
                destinationId: option.destinations[0].nodeId,
                countryId: Number(option.unitCountryId)
              }
            }
          }
        });

      } else if([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(upcomingTurn.turnType)) {
        // Basic retreats for testing, may be necessary to flesh out in detail later
        unitOptions.forEach((option: SavedOption) => {
          if (!preppedOrderLibrary[option.unitId]) {
            if (option.orderType === OrderDisplay.MOVE) {
              preppedOrderLibrary[option.unitId] = {
                unitId: option.unitId,
                orderType: OrderDisplay.MOVE,
                destinationId: option.destinations[0].nodeId,
                countryId: Number(option.unitCountryId)
              }
            }
          }
        });
      }

      for (let unitId in preppedOrderLibrary) {
        defaultOrders.push({
          orderSetId: orderSetLibrary[preppedOrderLibrary[unitId].countryId],
          unitId: preppedOrderLibrary[unitId].unitId,
          orderType: preppedOrderLibrary[unitId].orderType,
          destinationId: preppedOrderLibrary[unitId].destinationId
        });
      }
      db.optionsRepo.saveDefaultOrders(defaultOrders)
        .then((success: any) =>  {
          db.optionsRepo.setTurnDefaultsPrepped(upcomingTurn.turnId);
        }
      );
  }

  async getOrderOptions(idToken: string, gameId: number): Promise<TurnOptions> {
    const accountService = new AccountService();

    const userId = await accountService.getUserIdFromToken(idToken);
    const gameState = await db.gameRepo.getGameState(gameId);
    const playerCountry = await db.assignmentRepo.getCountryAssignment(gameId, userId);

    let pendingTurn: UpcomingTurn | undefined = undefined;
    let preliminaryTurn: UpcomingTurn | undefined = undefined;

    const upcomingTurns: UpcomingTurn[] = await db.schedulerRepo.getUpcomingTurns(gameId);
    if (upcomingTurns.length === 0) {
      console.log(`GameId ${gameId} has no upcoming turns!`);
    } else if (upcomingTurns.length > 0) {
      pendingTurn = upcomingTurns[0];
    }

    if (upcomingTurns.length === 2) {
      preliminaryTurn = upcomingTurns[1];
    } else if (upcomingTurns.length > 2) {
      console.log(`GameId ${gameId} has too many turns! (${upcomingTurns.length})`);
    }

    const turnOptions: TurnOptions = {
      playerId: userId,
      countryId: playerCountry.countryId,
      countryName: playerCountry.countryName
    };

    let pendingUnitOptions: SavedOption[] | undefined;
    let preliminaryUnitOptions: SavedOption[] | undefined;

    let pendingUnitOptionsFormatted: any = {};

    if (pendingTurn) {
      turnOptions.pending = {
        name: pendingTurn.turnName,
        turnType: 'Pending Turn',
        deadline: pendingTurn.deadline
      };
      // Units
      if ([
        TurnType.SPRING_ORDERS,
        TurnType.ORDERS_AND_VOTES,
        TurnType.SPRING_RETREATS,
        TurnType.FALL_ORDERS,
        TurnType.FALL_RETREATS
      ].includes(pendingTurn.turnType)) {
        turnOptions.pending.units = this.finalizeUnitOptions(
          await db.optionsRepo.getUnitOptions(gameState.turnId, pendingTurn.turnId, playerCountry.countryId)
        );
      }

      // Transfers
      if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
        turnOptions.pending.transfers = await db.optionsRepo.getTransferOptions(gameId, gameState.turnId);
      }

      // Adjustments
      if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
        const pendingBuildLocs: BuildLoc[] = await db.optionsRepo.getAvailableBuildLocs(gameId, gameState.turnId, playerCountry.countryId);
        const pendingAtRiskUnits: AtRiskUnit[] = await db.optionsRepo.getAtRiskUnits(gameState.turnId, playerCountry.countryId);
      }

      // Nominations
      if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
        const pendingNominatableCountries: NominatableCountry[] = await db.optionsRepo.getNominatableCountries(gameState.turnId);
      }

      // Votes
      if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
        const pendingNominations: Nomination[] = await db.optionsRepo.getNominations(gameState.turnId);
      }
    }

    if (preliminaryTurn) {
      turnOptions.preliminary = {
        name: preliminaryTurn.turnName,
        turnType: 'Preliminary Turn',
        deadline: preliminaryTurn.deadline
      };
      // Units
      if ([
        TurnType.SPRING_ORDERS,
        TurnType.ORDERS_AND_VOTES,
        TurnType.SPRING_RETREATS,
        TurnType.FALL_ORDERS,
        TurnType.FALL_RETREATS
      ].includes(preliminaryTurn.turnType)) {
        turnOptions.preliminary.units = this.finalizeUnitOptions(
          await db.optionsRepo.getUnitOptions(gameState.turnId, preliminaryTurn.turnId, playerCountry.countryId)
        );
      }

      // Transfers
      if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
        turnOptions.preliminary.transfers = await db.optionsRepo.getTransferOptions(gameId, gameState.turnId);
      }

      // Adjustments
      if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
        const preliminaryBuildLocs: BuildLoc[] = await db.optionsRepo.getAvailableBuildLocs(gameId, gameState.turnId, playerCountry.countryId);
        const preliminaryAtRiskUnits: AtRiskUnit[] = await db.optionsRepo.getAtRiskUnits(gameState.turnId, playerCountry.countryId);
      }

      // Nominations
      if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
        const preliminaryNominatableCountries: NominatableCountry[] = await db.optionsRepo.getNominatableCountries(gameState.turnId);
      }
    }

    return turnOptions;
  }

  finalizeUnitOptions(options: SavedOption[]): UnitOptionsFinalized[] {
    const unitOptionsLibrary: Record<string, UnitOptionsFinalized> = {};
    const unitOptionsFormatted: UnitOptionsFinalized[] = [];

    options.forEach((option: SavedOption) => {
      if (!unitOptionsLibrary[option.unitId]) {
        unitOptionsLibrary[option.unitId] = this.newUnitEssentialsKit(option);
      }

      const unit = unitOptionsLibrary[option.unitId];

      if (option.orderType === OrderDisplay.MOVE) {
        this.finalizeStandardMovement(option, unit);
      }

      if (option.orderType === OrderDisplay.MOVE_CONVOYED) {
        this.finalizeTransportedMovement(option, unit);
      }

      if (option.orderType === OrderDisplay.SUPPORT) {
        if (!unit.orderTypes.includes(OrderDisplay.SUPPORT)) {
          unit.orderTypes.push(OrderDisplay.SUPPORT);
        }

        if (!option.destinations) {
          this.finalizeHoldSupport(option, unit);
        } else {
          this.finalizeMoveSupport(option, unit);
        }
      }

      if (option.orderType === OrderDisplay.SUPPORT_CONVOYED) {
        this.finalizeMoveConvoyedSupport(option, unit);
      }

      if (option.orderType === OrderDisplay.CONVOY) {
        this.finalizeConvoys(option, unit);
      }

      if (option.orderType === OrderDisplay.AIRLIFT) {
        this.finalizeAirlifts(option, unit);
      }

      if (option.orderType === OrderDisplay.DETONATE) {
        this.finalizeNukeTargets(option, unit);
      }

    });

    this.transposeUnitOptions(unitOptionsLibrary, unitOptionsFormatted);

    return unitOptionsFormatted;
  }

  finalizeStandardMovement(option: SavedOption, unit: UnitOptionsFinalized): void {
    unit.orderTypes.push(OrderDisplay.MOVE);
    unit.moveDestinations = this.sortDestinations(option.destinations);
  }

  finalizeTransportedMovement(option: SavedOption, unit: UnitOptionsFinalized): void {
    unit.orderTypes.push(OrderDisplay.MOVE_CONVOYED);
    unit.moveTransportedDestinations = this.sortDestinations(option.destinations);
  }

  finalizeNukeTargets(option: SavedOption, unit: UnitOptionsFinalized): void {
    unit.orderTypes.push(OrderDisplay.DETONATE);
    unit.nukeTargets = this.sortDestinations(option.destinations);
  }

  finalizeHoldSupport(option: SavedOption, unit: UnitOptionsFinalized): void {
    if (option.secondaryUnitId && option.secondaryUnitLoc) {

      if (unit.supportStandardDestinations[option.secondaryUnitId]) {
        unit.supportStandardDestinations[option.secondaryUnitId].unshift(this.newUnitHoldNode(option.secondaryUnitLoc));

      } else {
        unit.supportStandardUnits.push(this.newSecondaryUnit(option));
        unit.supportStandardDestinations[option.secondaryUnitId] = [this.newUnitHoldNode(option.secondaryUnitLoc)];
      }

    } else {
      console.log(`Unit ${option.unitId} is attempting a support an invalid secondaryUnit: `
      + `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`);
    }
  }

  finalizeMoveSupport(option: SavedOption, unit: UnitOptionsFinalized): void {
    if (option.secondaryUnitId && option.secondaryUnitLoc) {

      if (unit.supportStandardDestinations[option.secondaryUnitId]) {
        unit.supportStandardDestinations[option.secondaryUnitId].push(...this.sortDestinations(option.destinations));
      } else {
        unit.supportStandardUnits.push(this.newSecondaryUnit(option));
        unit.supportStandardDestinations[option.secondaryUnitId] = this.sortDestinations(option.destinations);
      }

    } else {
      console.log(`Unit ${option.unitId} is attempting a support an invalid secondaryUnit: `
        + `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`);
    }
  }

  finalizeMoveConvoyedSupport(option: SavedOption, unit: UnitOptionsFinalized): void {
    if (option.secondaryUnitId && option.secondaryUnitLoc) {

      if (!unit.orderTypes.includes(OrderDisplay.SUPPORT_CONVOYED)) {
        unit.orderTypes.push(OrderDisplay.SUPPORT_CONVOYED);
      }
      unit.supportTransportedUnits.push(this.newSecondaryUnit(option));
      unit.supportTransportedDestinations[option.secondaryUnitId] = this.sortDestinations(option.destinations);

    } else {
      console.log(`Unit ${option.unitId} is attempting a convoyed support an invalid secondaryUnit: `
        + `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`);
    }
  }

  finalizeConvoys(option: SavedOption, unit: UnitOptionsFinalized): void {
    if (option.secondaryUnitId && option.secondaryUnitLoc) {

      if (!unit.orderTypes.includes(OrderDisplay.CONVOY)) {
        unit.orderTypes.push(OrderDisplay.CONVOY);
      }
      unit.transportableUnits.push(this.newSecondaryUnit(option));
      unit.transportDestinations[option.secondaryUnitId] = this.sortDestinations(option.destinations);

    } else {
      console.log(`Unit ${option.unitId} is attempting a convoyed support an invalid secondaryUnit: `
        + `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`);
    }
  }

  finalizeAirlifts(option: SavedOption, unit: UnitOptionsFinalized): void {
    if (option.secondaryUnitId && option.secondaryUnitLoc) {

      if (!unit.orderTypes.includes(OrderDisplay.AIRLIFT)) {
        unit.orderTypes.push(OrderDisplay.AIRLIFT);
      }
      unit.transportableUnits.push(this.newSecondaryUnit(option));
      unit.transportDestinations[option.secondaryUnitId] = this.sortDestinations(option.destinations);

    } else {
      console.log(`Unit ${option.unitId} is attempting a convoyed support an invalid secondaryUnit: `
        + `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`);
    }
  }

  newUnitEssentialsKit(option: SavedOption): UnitOptionsFinalized {
    return {
      unitId: option.unitId,
      unitType: option.unitType,
      unitDisplay: `${option.unitType} ${option.provinceName}`,
      unitLoc: option.unitLoc,
      orderTypes: option.canHold ? [OrderDisplay.HOLD] : [],
      moveDestinations: [],
      moveTransportedDestinations: [],
      nukeTargets: [],
      supportStandardUnits: [],
      supportStandardDestinations: {},
      supportTransportedUnits: [],
      supportTransportedDestinations: {},
      transportableUnits: [],
      transportDestinations: {}
    }
  }

  newSecondaryUnit(option: SavedOption): SecondaryUnit {
    return {
      id: option.secondaryUnitId,
      displayName: `${option.secondaryUnitType} ${option.secondaryProvinceName}`,
      loc: option.secondaryUnitLoc
    }
  }

  /**
   * Returns {
   *   nodeId: 0,
   *   nodeName: OrderDisplay.HOLD,
   *   loc: loc
   * }
   * @param loc
   * @returns
   */
  newUnitHoldNode(loc: number[]): OptionDestination {
    return {
      nodeId: 0,
      nodeName: OrderDisplay.HOLD,
      loc: loc
    }
  }

  sortActions(unit: UnitOptionsFinalized): void {
    const orderTypes: OrderDisplay[] = [];

    if (unit.orderTypes.includes(OrderDisplay.HOLD)) {
      orderTypes.push(OrderDisplay.HOLD);
    }

    if (unit.orderTypes.includes(OrderDisplay.MOVE)) {
      orderTypes.push(OrderDisplay.MOVE);
    }

    if (unit.orderTypes.includes(OrderDisplay.MOVE_CONVOYED)) {
      orderTypes.push(OrderDisplay.MOVE_CONVOYED);
    }

    if (unit.orderTypes.includes(OrderDisplay.SUPPORT)) {
      orderTypes.push(OrderDisplay.SUPPORT);
    }

    if (unit.orderTypes.includes(OrderDisplay.SUPPORT_CONVOYED)) {
      orderTypes.push(OrderDisplay.SUPPORT_CONVOYED);
    }

    if (unit.orderTypes.includes(OrderDisplay.CONVOY)) {
      orderTypes.push(OrderDisplay.CONVOY);
    }

    if (unit.orderTypes.includes(OrderDisplay.AIRLIFT)) {
      orderTypes.push(OrderDisplay.AIRLIFT);
    }

    if (unit.orderTypes.includes(OrderDisplay.DETONATE)) {
      orderTypes.push(OrderDisplay.DETONATE);
    }

    if (unit.orderTypes.includes(OrderDisplay.DISBAND)) {
      orderTypes.push(OrderDisplay.DISBAND);
    }

    unit.orderTypes = orderTypes;
  }

  sortSecondaryUnits(units: SecondaryUnit[]): SecondaryUnit[] {
    const nameToIndex: Record<string, number> = {};
    const sortArray = units.map((unit: SecondaryUnit, index: number) => {
      nameToIndex[unit.displayName] = index;
      return unit.displayName.split(' ')[1];
    });
    const sortedArray: SecondaryUnit[] = [];
    sortArray.sort().forEach((province: string) => {
      sortedArray.push(units[nameToIndex[province]]);
    });
    return sortedArray;
  }

  sortDestinations(destinations: OptionDestination[]): OptionDestination[] {
    const nameToIndex: Record<string, number> = {};
    let hasHold = false;
    let holdNodeLoc: number[] = [];
    const sortArray = destinations.map((destination: OptionDestination, index: number) => {
      if (destination.nodeId === 0) {
        hasHold = true;
        holdNodeLoc = destination.loc;
      }
      nameToIndex[destination.nodeName] = index;
      return destination.nodeName;
    });

    const sortedArray: OptionDestination[] = [];
    if (hasHold) {
      sortedArray.push(this.newUnitHoldNode(holdNodeLoc));
    }
    sortArray.sort().forEach((nodeName: string) => {
      if (nodeName !== OrderDisplay.HOLD) {
        sortedArray.push(destinations[nameToIndex[nodeName]]);
      }
    });
    return sortedArray;
  }

  transposeUnitOptions(unitOptionsLibrary: Record<string, UnitOptionsFinalized>, unitOptionsFormatted: UnitOptionsFinalized[]): void {
    let sortArray: string[] = [];
    let nameToIndex: Record<string, number> = {};

    for (let unitId in unitOptionsLibrary) {
      this.sortActions(unitOptionsLibrary[unitId]);

      const province = unitOptionsLibrary[unitId].unitDisplay.split(' ')[1];

      sortArray.push(province);
      nameToIndex[province] = Number(unitId);
    }

    sortArray.sort();
    sortArray.forEach((provinceName: string) => {
      unitOptionsFormatted.push(unitOptionsLibrary[nameToIndex[provinceName]]);
    });
  }
}