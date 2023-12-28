import { db } from '../../database/connection';
import { AssignmentType } from '../../models/enumeration/assignment-type-enum';
import { OrderDisplay } from '../../models/enumeration/order-display-enum';
import { ProvinceType } from '../../models/enumeration/province-enums';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { UnitType } from '../../models/enumeration/unit-enum';
import { UserAssignment } from '../../models/objects/assignment-objects';
import { Turn } from '../../models/objects/database-objects';
import { CountryState } from '../../models/objects/games/country-state-objects';
import { GameState } from '../../models/objects/last-turn-info-object';
import {
  OptionsContext,
  AdjacenctMovement,
  TransportPathLink,
  AirAdjacency,
  OrderOption,
  HoldSupport,
  UnitOptions,
  BuildLoc,
  BuildLocResult,
  Order,
  OrderPrepping,
  OrderSet,
  SavedOption,
  TransferCountry,
  OptionDestination,
  SecondaryUnit,
  UnitOptionsFinalized,
  DisbandOptions,
  NominatableCountry,
  NominationOptions,
  Nomination,
  AdjacentTransportable,
  AdjacentTransport,
  TransportDestination,
  RetreatingUnitAdjacyInfo,
  BuildLocProvince
} from '../../models/objects/option-context-objects';
import { OptionsFinal, BuildOptions, VotingOptions } from '../../models/objects/options-objects';
import { UpcomingTurn } from '../../models/objects/scheduler/upcoming-turns-object';
import { terminalAddendum, terminalLog } from '../utils/general';
import { AccountService } from './account-service';
import { copyObjectOfArrays, mergeArrays } from './data-structure-service';

export class OptionsService {
  async saveOptionsForTurn(turn: Turn, retreatingCountryIds?: number[]): Promise<void> {
    // const gameState: GameState = await db.gameRepo.getGameState(gameId);
    if (turn.turnId) {
      const optionsContext: OptionsContext = await this.processUnitOrderOptions(turn);

      await this.saveUnitOrderOptions(optionsContext, turn, retreatingCountryIds);
    } else {
      terminalLog(`Error saving Options: Turn for game (${turn.gameId}) has no turnId!`);
    }
  }

  async processUnitOrderOptions(turn: Turn): Promise<OptionsContext> {
    // Should always be called within saveOptionsForTurn, which checks turnId.
    // Error message there. This is just to make linter happy. Everyone loves a happy linter.
    if (!turn.turnId) {
      return this.createBlankOptionsContext();
    }

    const retreatTurn = [TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(turn.turnType);

    const unitInfo: UnitOptions[] = await this.fetchUnitAdjacencyInfo(
      turn.gameId,
      turn.turnNumber,
      retreatTurn
    );

    const optionsCtx: OptionsContext = {
      gameId: turn.gameId,
      turnId: turn.turnId,
      unitInfo: unitInfo,
      unitIdToIndexLib: {},
      sharedAdjProvinces: {},
      potentialConvoyProvinces: {},
      validConvoyAssistProvinces: [],
      transportPaths: {},
      transports: {},
      transportables: {},
      transportDestinations: {},
    };

    if (!retreatTurn) {
      this.sortAdjacencyInfo(optionsCtx);
      this.processTransportPaths(optionsCtx);
      this.processMoveSupport(optionsCtx);
      this.processNukeOptions(turn, optionsCtx);
    }


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
          optionsCtx.sharedAdjProvinces[adjacency.provinceId] = [
            {
              unitId: unit.unitId,
              nodeId: adjacency.nodeId,
              transported: false
            }
          ];
        }
      });

      // Transport Option Extraction
      if (unit.adjacentTransportables) {
        unit.adjacentTransportables.forEach((transportable: AdjacentTransportable) => {
          if (optionsCtx.transportables[transportable.unitId]) {
            optionsCtx.transportables[transportable.unitId].push(unit.unitId);
          } else {
            optionsCtx.transportables[transportable.unitId] = [unit.unitId];
          }
        });
      }

      if (unit.adjacentTransports) {
        unit.adjacentTransports.forEach((transport: AdjacentTransport) => {
          if (optionsCtx.transports[unit.unitId]) {
            optionsCtx.transports[unit.unitId].push(transport.unitId);
          } else {
            optionsCtx.transports[unit.unitId] = [transport.unitId];
          }
        });
      }

      if (unit.transportDestinations) {
        optionsCtx.transportDestinations[unit.unitId] = unit.transportDestinations.map(
          (destination: TransportDestination) => {
            return destination.nodeId;
          }
        );

        unit.transportDestinations.forEach((destination: TransportDestination) => {
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
    let duplicateShareCount = 0;

    for (const province in optionsCtx.sharedAdjProvinces) {
      if (optionsCtx.sharedAdjProvinces[province].length > 1) {
        const unitsInReach: { unitId: number; nodeId: number; transported: boolean }[] =
          optionsCtx.sharedAdjProvinces[province];


        unitsInReach.forEach(
          (commandedUnit: { unitId: number; nodeId: number; transported: boolean }, commandedIndex: number) => {
            unitsInReach.forEach(
              (supportedUnit: { unitId: number; nodeId: number; transported: boolean }, supportedIndex: number) => {
                if (commandedUnit.unitId !== supportedUnit.unitId) {
                  const cmdUnitDetails = this.getDetailedUnit(optionsCtx, commandedUnit.unitId);
                  const supportedUnitDetails = this.getDetailedUnit(optionsCtx, supportedUnit.unitId);
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
                } else if (commandedIndex !== supportedIndex) {
                  duplicateShareCount++;
                }
              }
            );
          }
        );
      }
    }

    if (duplicateShareCount > 0) {
      terminalAddendum(
        'Options Warning',
        `Game ${optionsCtx.gameId} turn ${optionsCtx.turnId} has ${duplicateShareCount} duplicate units sharing provinces`
      );
    }
  }

  processTransportPaths(optionsCtx: OptionsContext) {
    this.startPaths(optionsCtx);

    for (const transportedUnitId in optionsCtx.transportPaths) {
      this.extendPath(optionsCtx, optionsCtx.transportPaths[transportedUnitId], Number(transportedUnitId));
    }
  }

  startPaths(optionsCtx: OptionsContext) {
    for (const transportableId in optionsCtx.transportables) {
      const firstPathLink: TransportPathLink = {
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
        nextTransportOptions = optionsCtx.transports[transportId].filter(
          (optionId: number) => !nextTransports.includes(optionId)
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextContributions: any = copyObjectOfArrays(currentPathLink.contributions);
      for (const transport in nextContributions) {
        nextContributions[transport].push(...optionsCtx.transportDestinations[transportId]);
      }
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
        const transportedUnit = this.getDetailedUnit(optionsCtx, transportedUnitId);
        mergeArrays(transportedUnit.moveTransported, nextDestinations);

        for (const transportId in nextContributions) {
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

      const doesNotHaveUnit =
        adjProvince.filter((adjProvince: any) => adjProvince.unitId === transportedUnitId).length === 0;

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

  /**
   * Returns valid adjacency options for units given their current position and the restrictions of the next turn.
   * @param gameId
   * @param turnNumber
   * @param isRetreatTurn
   * @returns
   */
  async fetchUnitAdjacencyInfo(
    gameId: number,
    turnNumber: number,
    isRetreatTurn: boolean
  ): Promise<UnitOptions[]> {
    const unitOtions: UnitOptions[] = isRetreatTurn
      ? this.refineRetreatingUnitOptions(await db.optionsRepo.getRetreatingUnitAdjacencyInfo(gameId, turnNumber))
      : this.refineStandardUnitOptions(await db.optionsRepo.getUnitAdjacencyInfo(gameId, turnNumber));

    return unitOtions;
  }

  refineStandardUnitOptions(adjacencyInfo: UnitOptions[]): UnitOptions[] {
    return adjacencyInfo;
  }

  refineRetreatingUnitOptions(retreatingAdjacencyInfo: RetreatingUnitAdjacyInfo[]): UnitOptions[] {
    const unitOptions: UnitOptions[] = [];

    retreatingAdjacencyInfo.forEach((unit: RetreatingUnitAdjacyInfo) => {
      const invalidRetreats: number[] = unit.unitPresence?.map((unit: HoldSupport) => unit.provinceId) || [];
      invalidRetreats.push(unit.displacerProvinceId);

      const validRetreats: AdjacenctMovement[] = unit.adjacencies.filter((adjacency: AdjacenctMovement) =>
        !invalidRetreats.includes(adjacency.provinceId)
      );

      unitOptions.push({
        unitId: unit.unitId,
        unitName: unit.unitName,
        unitType: unit.unitType,
        nodeId: unit.nodeId,
        nodeName: unit.nodeName,
        provinceId: unit.provinceId,
        provinceName: unit.provinceName,
        adjacencies: validRetreats,
        moveTransported: [],
        holdSupports: [],
        moveSupports: {},
        transportSupports: {},
        nukeTargets: [],
        allTransports: {},
        adjacentTransports: undefined,
        adjacentTransportables: undefined,
        transportDestinations: undefined,
        nukeRange: -1
      });
    });

    return unitOptions;
  }

  async processNukeOptions(turn: Turn, optionsCtx: OptionsContext): Promise<void> {
    const airAdjArray: AirAdjacency[] = await db.optionsRepo.getAirAdjacencies(turn.gameId);
    const nukeTargetLib: any = {};
    const unlimitedRangeTargets: number[] = [];

    airAdjArray.forEach((nukeTarget: AirAdjacency, index: number) => {
      nukeTargetLib[nukeTarget.provinceName] = index;
      unlimitedRangeTargets.push(nukeTarget.nodeId);
    });

    optionsCtx.unitInfo
      .filter((unit: UnitOptions) => unit.unitType === UnitType.NUKE)
      .forEach((unit: UnitOptions) => {
        if (unit.nukeRange === 0) {
          unit.nukeTargets = unlimitedRangeTargets;
        } else if (unit.nukeRange) {
          unit.nukeTargets = this.processLimitedNukeTargets(airAdjArray, nukeTargetLib, unit);
        }
      });
  }

  processLimitedNukeTargets(airAdjArray: AirAdjacency[], nukeTargetLib: any, unit: UnitOptions): number[] {
    const nukeTargets: string[] = airAdjArray[nukeTargetLib[unit.provinceName]].adjacencies.map(
      (target: AdjacenctMovement) => {
        return target.provinceName;
      }
    );

    let rangeProcessed = 1;
    while (rangeProcessed < unit.nukeRange && nukeTargets.length < airAdjArray.length) {
      const targetsToAdd: string[] = [];
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
      return airAdjArray[nukeTargetLib[target]].nodeId;
    });
  }

  /**
   * Takes a finalized OptionsContext and assigned it to the provided turnId
   *
   * @param optionsContext
   * @param turnId
   */
  async saveUnitOrderOptions(optionsContext: OptionsContext, turn: Turn, retreatingCountryIds?: number[]): Promise<any> {
    const orderOptions: OrderOption[] = [];

    if (!turn.turnId) {
      terminalAddendum('Error: No Turn Id', JSON.stringify(turn));
      return;
    }

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
      if (retreatingCountryIds) {
        db.optionsRepo.deleteUnitOptions(turn.turnId).then(() => {
          db.optionsRepo.saveUnitOptions(orderOptions, turn.turnId!).then(() => {
            this.saveTurnDefaults(turn, retreatingCountryIds);
          });
        });
      } else {
        await db.optionsRepo.saveUnitOptions(orderOptions, turn.turnId).then(() => {
          this.saveTurnDefaults(turn);
        });
      }
    } else {
      terminalLog(`Operation Failure | No Options: Game ${optionsContext.gameId}, Turn ${turn.turnId}`);
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
    };

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
        };
      });
    }
    return holdSupportOptions;
  }

  formatSupportMoveStandard(unit: UnitOptions, turnId: number): OrderOption[] {
    const moveSupports: OrderOption[] = [];

    for (const supportedId in unit.moveSupports) {
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

    for (const supportedId in unit.transportSupports) {
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

    for (const transportedId in unit.allTransports) {
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
      orderType: OrderDisplay.NUKE,
      destinations: unit.nukeTargets,
      turnId: turnId
    };
  }

  async saveTurnDefaults(upcomingTurn: Turn, retreatingCountryIds?: number[]): Promise<void> {
    const orderSetLibrary: Record<string, number> = {};

    if (!upcomingTurn.turnId) {
      return;
    }

    const unitOptions: SavedOption[] = [TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(upcomingTurn.turnType)
        ? await db.optionsRepo.getRetreatingUnitOptions(
            upcomingTurn.gameId,
            upcomingTurn.turnNumber,
            upcomingTurn.turnId
          )
        : await db.optionsRepo.getUnitOptions(
            upcomingTurn.gameId,
            upcomingTurn.turnNumber,
            upcomingTurn.turnId
          );

    const newOrderSets = retreatingCountryIds
      ? await db.ordersRepo.insertRetreatedOrderSets(
          upcomingTurn.turnId,
          retreatingCountryIds
        )
      : await db.ordersRepo.insertTurnOrderSets(
          upcomingTurn.gameId,
          upcomingTurn.turnNumber,
          upcomingTurn.turnId,
          upcomingTurn.turnType
        );

    const finalizedUnitOptions: UnitOptionsFinalized[] = this.finalizeUnitOptions(unitOptions, upcomingTurn.turnType);

    newOrderSets.forEach((orderSet: OrderSet) => orderSetLibrary[orderSet.countryId] = orderSet.orderSetId);
    const defaultOrders: Order[] = [];

    finalizedUnitOptions.forEach((unit: UnitOptionsFinalized) => {
      if (orderSetLibrary[unit.unitCountryId]) {
        defaultOrders.push(this.prepDefaultOrder(unit, orderSetLibrary[unit.unitCountryId]));
      }
    });

    if (defaultOrders.length > 0) {
      db.ordersRepo.insertDefaultOrders(defaultOrders).then(() => {
        if (upcomingTurn.turnId) {
          db.ordersRepo.setTurnDefaultsPrepped(upcomingTurn.turnId);
        }
      });
      terminalAddendum('Default Orders Saved', `Game (${upcomingTurn.gameId}) | ${upcomingTurn.turnName} (${upcomingTurn.turnId})`);
    } else {
      terminalAddendum(
        `Process Failure`, `No Default Orders: Game (${upcomingTurn.gameId}) | ${upcomingTurn.turnName} (${upcomingTurn.turnId})`
      );
    }
  }

  async getTurnOptions(idToken: string, gameId: number): Promise<OptionsFinal> {
    const accountService = new AccountService();
    const gameState: GameState = await db.gameRepo.getGameState(gameId);

    let pendingTurn: UpcomingTurn | undefined = undefined;
    let preliminaryTurn: UpcomingTurn | undefined = undefined;

    const upcomingTurns: UpcomingTurn[] = await db.schedulerRepo.getUpcomingTurns(gameId);
    if (upcomingTurns.length > 0) {
      pendingTurn = upcomingTurns[0];
    }

    if (upcomingTurns.length === 2) {
      preliminaryTurn = upcomingTurns[1];
    } else if (upcomingTurns.length > 2) {
      terminalLog(`GameId ${gameId} has too many turns! (${upcomingTurns.length})`);
    }

    const userProfile = await accountService.getUserProfile(idToken);

    const fullOptions: OptionsFinal = {
      playerId: userProfile?.userId || 0,
      countryId: 0,
      countryName: 'Spectator',
      message: 'You are spectating. Turn options are not available.'
    }

    if (!userProfile) {
      terminalAddendum('Turn Options', `User profile doesn't exist for idToken (${idToken})`);
      return fullOptions;
    }

    terminalLog(
      `${userProfile.username} (${userProfile.userId}) requested turn options for ${gameState.gameName} (${gameState.gameId})`
    );
    let playerCountry: CountryState | undefined = undefined;
    const userAssignments: UserAssignment[] = await db.assignmentRepo.getUserAssignments(gameId, userProfile.userId);

    const userCountries = userAssignments.filter((assignment: UserAssignment) =>
      assignment.assignmentType === AssignmentType.PLAYER
    );

    if (userCountries.length > 0) {
      const countryStates = await db.gameRepo.getCountryState(
        gameId,
        gameState.turnNumber,
        userCountries[0].countryId
      );
      playerCountry = countryStates[0];

    } else {
      playerCountry = {
        countryId: 0,
        name: 'Spectator',
        countryStatus: 'Spectator',
        cityCount: 0,
        unitCount: 0,
        retreating: false,
        builds: 0,
        nukeRange: null,
        adjustments: 0,
        nukesInProduction: 0,
        pendingOrderSetId: null,
        preliminaryOrderSetId: null
      };
    }

    const turnOptions: OptionsFinal = {
      playerId: userProfile.userId,
      countryId: playerCountry.countryId,
      countryName: playerCountry.name
    };

    if (pendingTurn) {
      const applicable = ([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType) && playerCountry.retreating)
        || ![TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType);
      const message = [TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType) && !playerCountry.retreating
        ? 'You are not in retreat, but can submit prelimary orders for the following turn.'
          + ' Be mindful that some retreats may impact or even invalidate preliminary options!'
        : '';

      turnOptions.pending = {
        id: pendingTurn.turnId,
        status: TurnStatus.PENDING,
        name: pendingTurn.turnName,
        deadline: pendingTurn.deadline,
        applicable: applicable,
        message: message
      };

      // Units
      if (applicable && [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(pendingTurn.turnType)) {
        turnOptions.pending.units = this.finalizeUnitOptions(
          await db.optionsRepo.getUnitOptions(
            gameState.gameId,
            pendingTurn.turnNumber,
            pendingTurn.turnId,
            playerCountry.countryId
          ),
          pendingTurn.turnType
        );
      }

      if (applicable && [TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType)) {
        turnOptions.pending.units = this.finalizeUnitOptions(
          await db.optionsRepo.getRetreatingUnitOptions(
            gameState.gameId,
            pendingTurn.turnNumber,
            pendingTurn.turnId,
            playerCountry.countryId
          ),
          pendingTurn.turnType
        );
      }

      // Transfers
      if (applicable && [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
        if (playerCountry.builds > 0) {
          const buildTransferOptions: TransferCountry[] = await db.optionsRepo.getBuildTransferOptions(
            gameId,
            gameState.turnId
          );
          buildTransferOptions.unshift({ countryId: 0, countryName: '--Keep Builds--' });

          turnOptions.pending.buildTransfers = {
            options: buildTransferOptions,
            builds: playerCountry.builds
          };
        }

        if (playerCountry.nukeRange !== null) {
          const techTransferOptions: TransferCountry[] = await db.optionsRepo.getTechOfferOptions(
            gameId,
            gameState.turnId
          );
          techTransferOptions.unshift({ countryId: 0, countryName: '--Do Not Offer Tech--' });

          turnOptions.pending.receiveTechOptions = techTransferOptions;
        } else {
          const techTransferOptions: TransferCountry[] = await db.optionsRepo.getTechReceiveOptions(
            gameId,
            gameState.turnId
          );
          techTransferOptions.unshift({ countryId: 0, countryName: '--Do Not Request Tech--' });

          turnOptions.pending.offerTechOptions = techTransferOptions;
        }
      }

      // Adjustments
      if (applicable && [TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
        if (playerCountry.adjustments >= 0) {
          const buildLocs: BuildOptions = this.convertProvinceResultToNodeType(
            await db.optionsRepo.getAvailableBuildLocs(gameState.turnNumber, gameId, playerCountry.countryId)
          );

          turnOptions.pending.builds = {
            locations: buildLocs,
            builds: playerCountry.adjustments
          };
        } else {
          turnOptions.pending.disbands = await this.getDisbandOptions(gameState, playerCountry);
        }
      }

      // Nominations
      if (applicable && [TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
        turnOptions.pending.nominations = await this.getNominationOptions(gameState.gameId, gameState.turnId, TurnStatus.PENDING);
      }

      // Votes
      if (applicable && [TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
        turnOptions.pending.votes = await this.getVotingOptions(pendingTurn.turnId);
      }
    }

    if (pendingTurn && preliminaryTurn) {
      const applicable = ([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType) && !playerCountry.retreating);
      const message = [TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType) && playerCountry.retreating
        ? 'You are not in retreat and must play the pending turn first!'
        : '';

      turnOptions.preliminary = {
        id: preliminaryTurn.turnId,
        status: TurnStatus.PRELIMINARY,
        name: preliminaryTurn.turnName,
        deadline: preliminaryTurn.deadline,
        applicable: applicable,
        message: message
      };

      // Units
      if (applicable && [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(preliminaryTurn.turnType)) {
        turnOptions.preliminary.units = this.finalizeUnitOptions(
          await db.optionsRepo.getUnitOptions(
            gameState.gameId,
            preliminaryTurn.turnNumber,
            preliminaryTurn.turnId,
            playerCountry.countryId
          ),
          preliminaryTurn.turnType
        );
      }

      // Transfers
      if (applicable && [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
        if (playerCountry.builds > 0) {
          turnOptions.preliminary.buildTransfers = {
            options: await db.optionsRepo.getBuildTransferOptions(gameId, preliminaryTurn.turnId),
            builds: playerCountry.builds
          };
        }

        if (playerCountry.nukeRange) {
          turnOptions.preliminary.offerTechOptions = await db.optionsRepo.getTechOfferOptions(gameId, preliminaryTurn.turnId);
        } else {
          turnOptions.preliminary.offerTechOptions = await db.optionsRepo.getTechReceiveOptions(gameId, preliminaryTurn.turnId);
        }
      }

      // Adjustments
      if (applicable && [TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
        if (playerCountry.adjustments >= 0) {
          const buildLocs: BuildOptions = this.convertProvinceResultToNodeType(
            await db.optionsRepo.getAvailableBuildLocs(preliminaryTurn.turnNumber, gameId, playerCountry.countryId)
          );

          turnOptions.preliminary.builds = {
            locations: buildLocs,
            builds: playerCountry.adjustments
          };
        } else {
          turnOptions.preliminary.disbands = await this.getDisbandOptions(gameState, playerCountry)
        }
      }

      // Nominations
      if (applicable && [TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
        turnOptions.preliminary.nominations = await this.getNominationOptions(gameState.gameId, preliminaryTurn.turnId, TurnStatus.PENDING);
      }
    }

    return turnOptions;
  }

  finalizeUnitOptions(options: SavedOption[], turnType: TurnType): UnitOptionsFinalized[] {
    const unitOptionsLibrary: Record<string, UnitOptionsFinalized> = {};
    const unitOptionsFormatted: UnitOptionsFinalized[] = [];

    options.forEach((option: SavedOption) => {
      if (!unitOptionsLibrary[option.unitId]) {
        unitOptionsLibrary[option.unitId] = this.newUnitEssentialsKit(option, turnType);
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

      if (option.orderType === OrderDisplay.NUKE) {
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
    unit.orderTypes.push(OrderDisplay.NUKE);
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
      console.log(
        `Unit ${option.unitId} is attempting a support an invalid secondaryUnit: ` +
          `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`
      );
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
      console.log(
        `Unit ${option.unitId} is attempting a support an invalid secondaryUnit: ` +
          `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`
      );
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
      console.log(
        `Unit ${option.unitId} is attempting a convoyed support an invalid secondaryUnit: ` +
          `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`
      );
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
      console.log(
        `Unit ${option.unitId} is attempting a convoyed support an invalid secondaryUnit: ` +
          `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`
      );
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
      console.log(
        `Unit ${option.unitId} is attempting a convoyed support an invalid secondaryUnit: ` +
          `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`
      );
    }
  }

  newUnitEssentialsKit(option: SavedOption, turnType: TurnType): UnitOptionsFinalized {
    const initialOrderType: OrderDisplay[] = [];

    if ([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(turnType)) {
      initialOrderType.push(OrderDisplay.DISBAND);

    } else if (
      option.unitType !== UnitType.FLEET
      || option.provinceType !== ProvinceType.POLE
      || ![TurnType.FALL_ORDERS, TurnType.FALL_RETREATS].includes(turnType)
    )  {
      initialOrderType.push(OrderDisplay.HOLD);
    }

    return {
      unitId: option.unitId,
      unitType: option.unitType,
      unitDisplay: `${option.unitType} ${option.provinceName}`,
      unitCountryId: option.unitCountryId,
      unitProvinceName: option.provinceName,
      unitLoc: option.unitLoc,
      nodeId: option.nodeId,
      orderTypes: initialOrderType,
      moveDestinations: [],
      moveTransportedDestinations: [],
      nukeTargets: [],
      supportStandardUnits: [],
      supportStandardDestinations: {},
      supportTransportedUnits: [],
      supportTransportedDestinations: {},
      transportableUnits: [],
      transportDestinations: {}
    };
  }

  newSecondaryUnit(option: SavedOption): SecondaryUnit {
    return {
      id: option.secondaryUnitId,
      displayName: `${option.secondaryUnitType} ${option.secondaryProvinceName}`,
      loc: option.secondaryUnitLoc
    };
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
      nodeDisplay: OrderDisplay.HOLD,
      loc: loc
    };
  }

  sortActions(unit: UnitOptionsFinalized): void {
    const orderTypes: OrderDisplay[] = [];

    if (unit.orderTypes.includes(OrderDisplay.HOLD)) {
      orderTypes.push(OrderDisplay.HOLD);
    }

    if (unit.orderTypes.includes(OrderDisplay.DISBAND)) {
      orderTypes.push(OrderDisplay.DISBAND);
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

    if (unit.orderTypes.includes(OrderDisplay.NUKE)) {
      orderTypes.push(OrderDisplay.NUKE);
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

  transposeUnitOptions(
    unitOptionsLibrary: Record<string, UnitOptionsFinalized>,
    unitOptionsFormatted: UnitOptionsFinalized[]
  ): void {
    const sortArray: string[] = [];
    const nameToIndex: Record<string, number> = {};

    for (const unitId in unitOptionsLibrary) {
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

  async getDisbandOptions(gameState: GameState, countryState: CountryState): Promise<DisbandOptions> {
    const disbandOptions: DisbandOptions = {
      disbandCount: countryState.adjustments * -1,
      cityCount: countryState.cityCount,
      unitCount: countryState.unitCount,
      units: await db.optionsRepo.getAtRiskUnits(gameState.gameId, gameState.turnNumber, countryState.countryId),
      nukesInProduction: countryState.nukesInProduction,
      nukeLocs: []
    };

    if (countryState.nukesInProduction > 0) {
      for (let index = 0; index < countryState.nukesInProduction; index++) {
        disbandOptions.units.unshift({
          unitId: index * -1,
          countryId: countryState.countryId,
          unitType: UnitType.NUKE,
          provinceName: 'Finished',
          loc: [0, 0]
        });
      }

      const nukePlacementCities: BuildLoc[] = await db.optionsRepo.getActiveCountryCenters(
        gameState.gameId,
        gameState.turnNumber,
        countryState.countryId
      );
      nukePlacementCities.unshift({
        nodeId: 0,
        loc: [0, 0],
        province: '---',
        display: '---'
      });

      disbandOptions.nukeLocs = nukePlacementCities;
    }

    return disbandOptions;
  }

  async getNominationOptions(gameId: number, turnNumber: number, turnStatus: TurnStatus): Promise<NominationOptions> {
    const nominatableCountries = await db.optionsRepo.getNominatableCountries(gameId, turnNumber);
    const coaliationSchedule = await db.gameRepo.getCoalitionSchedule(gameId);

    nominatableCountries.forEach((country: NominatableCountry) => {
      country.penalty = coaliationSchedule.penalties[country.rank];
    });

    nominatableCountries.unshift({
      countryId: 0,
      countryName: '-- Select Country--',
      rank: '-',
      penalty: 0
    });

    return {
      victoryBase: coaliationSchedule.baseFinal,
      countries: nominatableCountries
    };
  }

  async getVotingOptions(turnId: number): Promise<VotingOptions> {
    const nominations: Nomination[] = await db.optionsRepo.getNominations(turnId);

    const duplicateAlerts: string[] = [];
    const signatureCounts: Record<string, number> = {};
    const spliceIndeces: number[] = [];

    nominations.forEach((nomination: Nomination, index: number) => {
      const countrySignature: string = nomination.countries
        .map((country: NominatableCountry) => country.countryName)
        .sort()
        .join(', ');
      if (signatureCounts[countrySignature]) {
        signatureCounts[countrySignature]++;
        spliceIndeces.push(index);
      } else {
        signatureCounts[countrySignature] = 1;
      }
    });

    for (const signature in signatureCounts) {
      if (signatureCounts[signature] > 1) {
        duplicateAlerts.push(`${signature} was nominated ${signatureCounts[signature]} times!`);
      }
    }

    for (let index = spliceIndeces.length - 1; index >= 0; index--) {
      nominations.splice(spliceIndeces[index], 1);
    }

    return {
      duplicateAlerts: duplicateAlerts,
      nominations: nominations
    };
  }

  prepDefaultOrder(unitOptions: UnitOptionsFinalized, orderSetId: number): Order {
    let description = `${unitOptions.unitType.toUpperCase()[0]} ${unitOptions.unitProvinceName} `;

    const firstOrderType = unitOptions.orderTypes[0];

    if ([OrderDisplay.HOLD, OrderDisplay.DISBAND, OrderDisplay.INVALID].includes(firstOrderType)) {
      description += firstOrderType;
    } else {
      description += `=> ${unitOptions.moveDestinations[0].nodeDisplay}`;
    }

    return <Order> {
      orderedUnitId: unitOptions.unitId,
      orderSetId: orderSetId,
      orderType: firstOrderType,
      description: description,
      destinationId: [OrderDisplay.HOLD, OrderDisplay.DISBAND, OrderDisplay.INVALID].includes(firstOrderType)
        ? undefined
        : unitOptions.moveDestinations[0].nodeId,
      countryId: unitOptions.unitCountryId
    };
  }

  /**
   * Deprecated
  */
  setOptionDescription(option: SavedOption): string {
    let description = `${option.unitType[0].toUpperCase()} ${option.provinceName} `;

    if ([OrderDisplay.HOLD, OrderDisplay.DISBAND, OrderDisplay.INVALID].includes(option.orderType)) {
      description += option.orderType;
    }

    if ([OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(option.orderType)) {
      description += `=> ${option.destinations[0].nodeDisplay}`;
    }

    if (
      option.orderType === OrderDisplay.SUPPORT &&
      option.secondaryUnitType &&
      option.secondaryOrderType &&
      ![OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(option.secondaryOrderType)
    ) {
      description += `S ${option.secondaryUnitType[0].toUpperCase()} ${option.secondaryProvinceName}`;
    }

    if (
      [OrderDisplay.SUPPORT, OrderDisplay.CONVOY, OrderDisplay.AIRLIFT].includes(option.orderType) &&
      option.secondaryUnitType &&
      option.secondaryOrderType !== undefined &&
      [OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(option.secondaryOrderType)
    ) {
      description += `${option.orderType[0].toUpperCase()} ${option.secondaryUnitType[0].toUpperCase()} ${
        option.secondaryProvinceName
      } => ${option.destinations[0].nodeDisplay}`;
    }

    if (option.orderType === OrderDisplay.NUKE) {
      description += `! ${option.destinations[0].nodeDisplay}`;
    }

    return description;
  }

  /**
   * This is blank just to satisfy returns. Only instantiated if there's a problem.
   *
   * @returns OptionsContext
   */
  createBlankOptionsContext(): OptionsContext {
    return {
      gameId: 0,
      turnId: 0,
      unitInfo: [],
      unitIdToIndexLib: undefined,
      sharedAdjProvinces: undefined,
      potentialConvoyProvinces: undefined,
      validConvoyAssistProvinces: [],
      transportPaths: undefined,
      transports: undefined,
      transportables: undefined,
      transportDestinations: undefined
    }
  }

  convertProvinceResultToNodeType(buildProvinces: BuildLocProvince[]): BuildOptions {
    const buildLocs: BuildOptions = {
      land: [],
      sea: [],
      air: []
    };

    buildProvinces.forEach((loc: BuildLocProvince) => {
      if (loc.seaNodeName && loc.seaNodeName.split('_').length > 2 && loc.seaNodeId && loc.seaNodeLoc) {
        if (buildLocs.land.filter((landLoc: BuildLoc) => landLoc.nodeId === loc.landNodeId).length === 0) {
          buildLocs.land.push({
            province: loc.provinceName,
            display: loc.provinceName,
            nodeId: loc.landNodeId,
            loc: loc.landNodeLoc
          });

          buildLocs.air.push({
            province: loc.provinceName,
            display: loc.provinceName,
            nodeId: loc.airNodeId,
            loc: loc.airNodeLoc
          });
        }

        const locDisplay = loc.seaNodeName.toUpperCase().split('_');
        buildLocs.sea.push({
          province: loc.provinceName,
          display: locDisplay[0] + ' ' + locDisplay[2],
          nodeId: loc.seaNodeId,
          loc: loc.seaNodeLoc
        });
      } else {
        buildLocs.land.push({
          province: loc.provinceName,
          display: loc.provinceName,
          nodeId: loc.landNodeId,
          loc: loc.landNodeLoc
        });

        if (loc.seaNodeId && loc.seaNodeLoc)
          buildLocs.sea.push({
            province: loc.provinceName,
            display: loc.provinceName,
            nodeId: loc.seaNodeId,
            loc: loc.seaNodeLoc
          });

        buildLocs.air.push({
          province: loc.provinceName,
          display: loc.provinceName,
          nodeId: loc.airNodeId,
          loc: loc.airNodeLoc
        });
      }
    });

    return buildLocs;
  }
}
