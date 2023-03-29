import { db } from '../../database/connection';
import { OrderDisplay } from '../../models/enumeration/order-display-enum';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { UnitType } from '../../models/enumeration/unit-enum';
import { UserAssignment } from '../../models/objects/assignment-objects';
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
  TransportDestination
} from '../../models/objects/option-context-objects';
import { OptionsFinal, BuildOptions, VotingOptions } from '../../models/objects/options-objects';
import { UpcomingTurn } from '../../models/objects/scheduler/upcoming-turns-object';
import { AccountService } from './accountService';
import { copyObjectOfArrays, mergeArrays } from './data-structure-service';

export class OptionsService {
  async saveOptionsForNextTurn(gameId: number, turnId?: number): Promise<void> {
    const gameState: GameState = await db.gameRepo.getGameState(gameId);

    const optionsContext: OptionsContext = await this.processUnitOrderOptions(gameState);

    await this.saveUnitOrderOptions(optionsContext, turnId ? turnId : optionsContext.turnId);
  }

  async processUnitOrderOptions(gameState: GameState): Promise<OptionsContext> {
    const unitInfo: UnitOptions[] = await this.getUnitAdjacencyInfo(gameState.gameId, gameState.turnNumber);

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
    for (const province in optionsCtx.sharedAdjProvinces) {
      if (optionsCtx.sharedAdjProvinces[province].length > 1) {
        const unitsInReach: { unitId: number; nodeId: number; transported: boolean }[] =
          optionsCtx.sharedAdjProvinces[province];

        unitsInReach.forEach(
          (commandedUnit: { unitId: number; nodeId: number; transported: boolean }, commandIdx: number) => {
            unitsInReach.forEach(
              (supportedUnit: { unitId: number; nodeId: number; transported: boolean }, supportIdx: number) => {
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
              }
            );
          }
        );
      }
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

  async getUnitAdjacencyInfo(gameId: number, turnNumber: number): Promise<UnitOptions[]> {
    const unitOtions: UnitOptions[] = await db.optionsRepo.getUnitAdjacencyInfo(gameId, turnNumber);

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
      // await db.ordersRepo.saveOrderOptions(orderOptions, turnId);
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

  async saveDefaultOrders(gameId: number): Promise<void> {
    const gameState = await db.gameRepo.getGameState(gameId);

    const upcomingTurns: UpcomingTurn[] = await db.schedulerRepo.getUpcomingTurns(gameId);

    const pendingTurn: UpcomingTurn | undefined = upcomingTurns.filter(
      (turn: UpcomingTurn) => turn.turnStatus === TurnStatus.PENDING
    )[0];

    const preliminaryTurn: UpcomingTurn | undefined = upcomingTurns.filter(
      (turn: UpcomingTurn) => turn.turnStatus === TurnStatus.PRELIMINARY
    )[0];

    if (pendingTurn && !pendingTurn.defaultsReady) {
      this.saveTurnDefaults(gameState, pendingTurn);
    }

    if (preliminaryTurn && !preliminaryTurn.defaultsReady) {
      this.saveTurnDefaults(gameState, preliminaryTurn);
    }
  }

  async saveTurnDefaults(gameState: GameState, upcomingTurn: UpcomingTurn): Promise<void> {
    const orderSetLibrary: Record<string, number> = {};
    const newOrderSets = await db.ordersRepo.insertTurnOrderSets(
      gameState.gameId,
      gameState.turnNumber,
      upcomingTurn.turnId
    );
    newOrderSets.forEach((orderSet: OrderSet) => (orderSetLibrary[orderSet.countryId] = orderSet.orderSetId));
    const unitOptions: SavedOption[] = await db.optionsRepo.getUnitOptions(
      gameState.gameId,
      gameState.turnNumber,
      upcomingTurn.turnId
    );
    const preppedOrderLibrary: Record<string, OrderPrepping> = {};
    const defaultOrders: Order[] = [];

    if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(upcomingTurn.turnType)) {
      unitOptions.forEach((option: SavedOption) => {
        if (!preppedOrderLibrary[option.unitId]) {
          preppedOrderLibrary[option.unitId] = {
            unitId: option.unitId,
            orderType: OrderDisplay.HOLD,
            destinationId: undefined,
            countryId: Number(option.unitCountryId)
          };
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
            };
          } else if (option.orderType === OrderDisplay.MOVE) {
            preppedOrderLibrary[option.unitId] = {
              unitId: option.unitId,
              orderType: OrderDisplay.MOVE,
              destinationId: option.destinations[0].nodeId,
              countryId: Number(option.unitCountryId)
            };
          }
        }
      });
    } else if ([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(upcomingTurn.turnType)) {
      // Basic retreats for testing, may be necessary to flesh out in detail later
      unitOptions.forEach((option: SavedOption) => {
        if (!preppedOrderLibrary[option.unitId]) {
          if (option.orderType === OrderDisplay.MOVE) {
            preppedOrderLibrary[option.unitId] = {
              unitId: option.unitId,
              orderType: OrderDisplay.MOVE,
              destinationId: option.destinations[0].nodeId,
              countryId: Number(option.unitCountryId)
            };
          }
        }
      });
    }

    for (const unitId in preppedOrderLibrary) {
      defaultOrders.push({
        orderSetId: orderSetLibrary[preppedOrderLibrary[unitId].countryId],
        orderedUnitId: preppedOrderLibrary[unitId].unitId,
        orderType: preppedOrderLibrary[unitId].orderType,
        destinationId: preppedOrderLibrary[unitId].destinationId
      });
    }
    db.ordersRepo.saveDefaultOrders(defaultOrders).then((success: any) => {
      db.ordersRepo.setTurnDefaultsPrepped(upcomingTurn.turnId);
    });
  }

  async getTurnOptions(idToken: string, gameId: number): Promise<OptionsFinal | string> {
    const accountService = new AccountService();
    const userId = await accountService.getUserIdFromToken(idToken);

    const gameState: GameState = await db.gameRepo.getGameState(gameId);
    let playerCountry: CountryState | undefined = undefined;
    const playerCountries: UserAssignment[] = await db.assignmentRepo.getUserAssignments(gameId, userId);
    if (playerCountries.length > 0) {
      const countryStates = await db.gameRepo.getCountryState(
        gameId,
        gameState.turnNumber,
        playerCountries[0].countryId
      );
      playerCountry = countryStates[0];
    }

    if (playerCountry === undefined) {
      return 'User is not assigned an active country';
    }

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

    const turnOptions: OptionsFinal = {
      playerId: userId,
      countryId: playerCountry.countryId,
      countryName: playerCountry.name
    };

    if (pendingTurn) {
      turnOptions.pending = {
        id: pendingTurn.turnId,
        name: pendingTurn.turnName,
        deadline: pendingTurn.deadline
      };
      // Move back after dev
      turnOptions.votes = {
        turnStatus: TurnStatus.PENDING,
        options: await this.getVotingOptions(pendingTurn.turnId)
      };
      ////

      // Units
      if (
        [
          TurnType.SPRING_ORDERS,
          TurnType.ORDERS_AND_VOTES,
          TurnType.SPRING_RETREATS,
          TurnType.FALL_ORDERS,
          TurnType.FALL_RETREATS
        ].includes(pendingTurn.turnType)
      ) {
        turnOptions.units = {
          turnStatus: TurnStatus.PENDING,
          options: this.finalizeUnitOptions(
            await db.optionsRepo.getUnitOptions(
              gameState.gameId,
              gameState.turnNumber,
              pendingTurn.turnId,
              playerCountry.countryId
            )
          )
        };
      }

      // Transfers
      if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
        if (playerCountry.builds > 0) {
          const buildTransferOptions: TransferCountry[] = await db.optionsRepo.getBuildTransferOptions(
            gameId,
            gameState.turnId
          );
          buildTransferOptions.unshift({ countryId: 0, countryName: '--Keep Builds--' });

          turnOptions.buildTransfers = {
            turnStatus: TurnStatus.PENDING,
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

          turnOptions.receiveTechOptions = {
            turnStatus: TurnStatus.PENDING,
            options: techTransferOptions
          };
        } else {
          const techTransferOptions: TransferCountry[] = await db.optionsRepo.getTechReceiveOptions(
            gameId,
            gameState.turnId
          );
          techTransferOptions.unshift({ countryId: 0, countryName: '--Do Not Request Tech--' });

          turnOptions.offerTechOptions = {
            turnStatus: TurnStatus.PENDING,
            options: techTransferOptions
          };
        }
      }

      // Adjustments
      if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
        if (playerCountry.adjustments >= 0) {
          const buildLocsResult: BuildLocResult[] = await db.optionsRepo.getAvailableBuildLocs(
            gameState.turnNumber,
            gameId,
            playerCountry.countryId
          );
          const buildLocs: BuildOptions = {
            land: [],
            sea: [],
            air: []
          };

          buildLocsResult.forEach((loc: BuildLocResult) => {
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

          turnOptions.builds = {
            turnStatus: TurnStatus.PENDING,
            locations: buildLocs,
            builds: playerCountry.adjustments
          };
        } else {
          turnOptions.disbands = {
            turnStatus: TurnStatus.PENDING,
            options: await this.getDisbandOptions(gameState, playerCountry)
          };
        }
      }

      // Nominations
      if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
        turnOptions.nominations = {
          turnStatus: pendingTurn.turnStatus,
          options: await this.getNominationOptions(gameState.gameId, gameState.turnId, TurnStatus.PENDING)
        };
      }

      // Votes
      if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
        turnOptions.votes = {
          turnStatus: TurnStatus.PENDING,
          options: await this.getVotingOptions(pendingTurn.turnId)
        };
      }
    }

    if (preliminaryTurn) {
      turnOptions.preliminary = {
        id: preliminaryTurn.turnId,
        name: preliminaryTurn.turnName,
        deadline: preliminaryTurn.deadline
      };
      // Units
      if (
        [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(preliminaryTurn.turnType)
      ) {
        turnOptions.units = {
          turnStatus: TurnStatus.PRELIMINARY,
          options: this.finalizeUnitOptions(
            await db.optionsRepo.getUnitOptions(
              gameState.gameId,
              gameState.turnNumber,
              preliminaryTurn.turnId,
              playerCountry.countryId
            )
          )
        };
      }

      // Transfers
      if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
        if (playerCountry.builds > 0) {
          turnOptions.buildTransfers = {
            turnStatus: TurnStatus.PRELIMINARY,
            options: await db.optionsRepo.getBuildTransferOptions(gameId, gameState.turnId),
            builds: playerCountry.builds
          };
        }

        if (playerCountry.nukeRange) {
          turnOptions.offerTechOptions = {
            turnStatus: TurnStatus.PRELIMINARY,
            options: await db.optionsRepo.getTechOfferOptions(gameId, gameState.turnId)
          };
        } else {
          turnOptions.offerTechOptions = {
            turnStatus: TurnStatus.PRELIMINARY,
            options: await db.optionsRepo.getTechReceiveOptions(gameId, gameState.turnId)
          };
        }
      }

      // Adjustments
      if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
        if (playerCountry.adjustments >= 0) {
          const buildLocsResult: BuildLocResult[] = await db.optionsRepo.getAvailableBuildLocs(
            gameState.turnNumber,
            gameId,
            playerCountry.countryId
          );
          const buildLocs: BuildOptions = {
            land: [],
            sea: [],
            air: []
          };

          buildLocsResult.forEach((loc: BuildLocResult) => {
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

          turnOptions.builds = {
            turnStatus: TurnStatus.PENDING,
            locations: buildLocs,
            builds: playerCountry.adjustments
          };
        } else {
          turnOptions.disbands = {
            turnStatus: TurnStatus.PENDING,
            options: await this.getDisbandOptions(gameState, playerCountry)
          };
        }
      }

      // Nominations
      if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
        turnOptions.nominations = {
          turnStatus: preliminaryTurn.turnStatus,
          options: await this.getNominationOptions(gameState.gameId, gameState.turnId, TurnStatus.PENDING)
        };
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

  newUnitEssentialsKit(option: SavedOption): UnitOptionsFinalized {
    return {
      unitId: option.unitId,
      unitType: option.unitType,
      unitDisplay: `${option.unitType} ${option.provinceName}`,
      unitLoc: option.unitLoc,
      nodeId: option.nodeId,
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
      loc: loc
    };
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

    if (unit.orderTypes.includes(OrderDisplay.NUKE)) {
      orderTypes.push(OrderDisplay.NUKE);
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
}
