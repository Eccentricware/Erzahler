import { db } from '../../database/connection';
import {
  CountryAssets,
  CountryHistoryRow,
  CountryStatChanges,
  CountryStatCounts,
  DbStates,
  DbUpdates,
  ProvinceHistoryRow,
  UnitHistoryRow
} from '../../database/schema/table-fields';
import { OrderDisplay } from '../../models/enumeration/order-display-enum';
import { OrderStatus } from '../../models/enumeration/order-status-enum';
import { ProvinceStatus, ProvinceType, CityType } from '../../models/enumeration/province-enums';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { BuildType, UnitStatus, UnitType } from '../../models/enumeration/unit-enum';
import { NewTurn, NominationRow, Turn } from '../../models/objects/database-objects';
import { StartDetails } from '../../models/objects/initial-times-object';
import { GameState } from '../../models/objects/last-turn-info-object';
import {
  AdjacentTransport,
  CountryVotes,
  NominatableCountry,
  Nomination,
  OptionDestination,
  SecondaryUnit,
  TransportDestination,
  UnitOptionsFinalized
} from '../../models/objects/option-context-objects';
import { TransferBuildOrder, TransferTechOrder } from '../../models/objects/order-objects';
import {
  AdjResolutionData,
  AdjustmentResolutionResources,
  CountryTransferResources,
  OrderDependencies,
  OrderResolutionLocation,
  OrderSupremacy,
  TransferResources,
  TransportAttempt,
  TransportNetworkUnit,
  UnitAndCountryIds,
  UnitOrderGroups,
  UnitOrderResolution
} from '../../models/objects/resolution/order-resolution-objects';
import { UpcomingTurn } from '../../models/objects/scheduler/upcoming-turns-object';
import { formatTurnName, terminalAddendum, terminalLog } from '../utils/general';
import { GameService } from './game-service';
import { OptionsService } from './options-service';
import { SchedulerService } from './scheduler-service';
import { OrdersService } from './orders-service';
import { CountryStatus } from '../../models/enumeration/country-enum';
import { CountryHistoryBuilder } from '../../models/classes/county-history-builder';

export class ResolutionService {
  optionsService: OptionsService = new OptionsService();
  orderService: OrdersService = new OrdersService();
  schedulerService: SchedulerService = new SchedulerService();
  gameService: GameService = new GameService();

  async startGame(gameId: number): Promise<void> {
    const startDetails: StartDetails = await this.schedulerService.getStartDetails(gameId);
    terminalLog(`Starting game ${startDetails.gameName} (${gameId})`);

    const firstTurn: Turn = {
      turnId: 0,
      gameId: gameId,
      turnNumber: 1,
      turnName: formatTurnName(TurnType.SPRING_ORDERS, startDetails.stylizedYear),
      turnType: TurnType.SPRING_ORDERS,
      turnStatus: TurnStatus.PENDING,
      yearNumber: 1,
      deadline: startDetails.firstTurn
    };

    await db.schedulerRepo
      .insertTurn(firstTurn)
      .then(async (nextTurn: NewTurn) => {
        this.schedulerService.scheduleTurn(nextTurn.turnId, nextTurn.deadline);
        await this.optionsService.saveOptionsForTurn(nextTurn);
        await db.gameRepo.setGamePlaying(gameId);
        // Alert service call
      })
      .catch((err: Error) => {
        terminalLog(`Error starting game ${gameId}: ${err.message}`);
      });
  }

  async resolveTurn(turnId: number): Promise<void> {
    const turn: UpcomingTurn | undefined = await db.schedulerRepo.getUpcomingTurnDetails(turnId);

    if (!turn) {
      terminalAddendum('Resolution', `Can't find turn by turnId ${turnId}`);
      return;
    }

    switch (turn.turnType) {
      case TurnType.SPRING_ORDERS:
        await this.resolveSpringOrders(turn);
        break;
      case TurnType.SPRING_RETREATS:
        await this.resolveSpringRetreats(turn);
        break;
      case TurnType.FALL_ORDERS:
        await this.resolveFallOrders(turn);
        break;
      case TurnType.FALL_RETREATS:
        await this.resolveFallRetreats(turn);
        break;
      case TurnType.ADJUSTMENTS:
      case TurnType.ADJ_AND_NOM:
        await this.resolveAdjustments(turn);
        break;
      case TurnType.NOMINATIONS:
        await this.resolveNominations(turn);
        break;
      case TurnType.VOTES:
      case TurnType.ORDERS_AND_VOTES:
        await this.resolveVotes(turn);
        break;
    }
  }

  async resolveOrdersAndVotes(turn: UpcomingTurn): Promise<void> {
    const winningCoalition = undefined;

    if (!winningCoalition) {
      this.resolveSpringOrders(turn);
    }
  }

  async resolveSpringOrders(turn: UpcomingTurn): Promise<void> {
    const gameState: GameState = await db.gameRepo.getGameState(turn.gameId);
    const dbStates: DbStates = {
      game: {},
      turn: {},
      orderSets: [],
      orders: [],
      unitHistories: await db.gameRepo.getUnitHistories(turn.gameId, gameState.turnNumber),
      provinceHistories: await db.gameRepo.getProvinceHistories(turn.gameId, gameState.turnNumber),
      countryHistories: await db.gameRepo.getCountryHistories(turn.gameId, gameState.turnNumber)
    };

    // DB Update
    const dbUpdates: DbUpdates = {
      game: {},
      turn: {},
      orderSets: [],
      adjOrderSets: {},
      orders: [],
      adjustmentOrders: [],
      newUnits: [],
      unitHistories: {},
      provinceHistories: {},
      countryHistories: {},
      countryStatChanges: {}
    };

    let unitsRetreating = false;

    // dbStates.provinceHistories = await db.gameRepo.getProvinceHistories(turn.gameId, gameState.turnNumber);
    // dbStates.unitHistories = await db.gameRepo.getUnitHistories(turn.gameId, gameState.turnNumber);

    const unitMovementResults: UnitOrderResolution[] = await this.resolveUnitOrders(gameState, turn);

    unitMovementResults.forEach((result: UnitOrderResolution) => {
      if (result.orderId > 0) {
        dbUpdates.orders.push({
          orderId: result.orderId,
          orderStatus: OrderStatus.PROCESSED,
          orderSuccess: result.orderSuccess,
          power: result.power,
          description: result.description,
          primaryResolution: result.primaryResolution,
          secondaryResolution: result.secondaryResolution
        });
      }

      // Includes Province rows. Units don't have to be nuked. Striker always has eyes on nuked province
      if (result.orderType === OrderDisplay.NUKE) {
        this.handleNuclearStrike(result, dbStates, dbUpdates);
      }

      if (result.unit.status === UnitStatus.NUKED) {
        this.handleNuclearVictim(result, dbStates, dbUpdates);
      }

      // Includes province contesting
      if (result.orderType !== OrderDisplay.NUKE && result.unit.status !== UnitStatus.NUKED) {
        this.handleSpringMovement(result, dbStates, dbUpdates);
      }

      if (result.unit.status === UnitStatus.RETREAT) {
        unitsRetreating = true;
        if (dbUpdates.countryStatChanges[result.unit.countryId]) {
          dbUpdates.countryStatChanges[result.unit.countryId].inRetreat = true;
        } else {
          dbUpdates.countryStatChanges[result.unit.countryId] = new CountryHistoryBuilder({
            countryId: result.unit.countryId,
            inRetreat: true
          })
        }
      }
    });

    // Cancel conflicts for retreats if there are no retreats
    if (!unitsRetreating) {
      this.revertContestedProvinces(dbStates.provinceHistories, dbUpdates.provinceHistories);
    }

    Object.values(dbUpdates.unitHistories).forEach((unitHistory: UnitHistoryRow) => {
      if (unitHistory.unitStatus === UnitStatus.FALLOUT) {
        unitHistory.falloutEndTurn = unitsRetreating ? turn.turnNumber + 1 : turn.turnNumber;
      }
    });

    const transferResults = await this.resolveTransfers(gameState, turn);

    transferResults.techTransferResults?.forEach((result: TransferTechOrder) => {
      if (result.success && result.hasNukes) {
        if (dbUpdates.countryStatChanges[result.foreignCountryId]) {
          dbUpdates.countryStatChanges[result.foreignCountryId].nukeRange = gameState.defaultNukeRange;
          dbUpdates.countryStatChanges[result.foreignCountryId].nukesInProduction = 0;

        } else {
          dbUpdates.countryStatChanges[result.foreignCountryId] = new CountryHistoryBuilder({
            countryId: result.foreignCountryId,
            nukeRange: gameState.defaultNukeRange,
            nukesInProduction: 0
          });
        }
      }
    });

    transferResults.buildTransferResults?.forEach((result: TransferBuildOrder) => {
      if (result.quantity > 0) {
        if (dbUpdates.countryStatChanges[result.countryId]) {
          dbUpdates.countryStatChanges[result.countryId].bankedBuildsGifted = result.quantity;
        } else {
          dbUpdates.countryStatChanges[result.countryId] = new CountryHistoryBuilder({
            countryId: result.countryId,
            bankedBuildsGifted: result.quantity
          });
        }

        if (dbUpdates.countryStatChanges[result.recipientId]) {
          dbUpdates.countryStatChanges[result.recipientId].bankedBuildsReceived = result.quantity;
        } else {
          dbUpdates.countryStatChanges[result.recipientId] = new CountryHistoryBuilder({
            countryId: result.recipientId,
            bankedBuildsReceived: result.quantity
          })
        }
      }
    });

    this.prepareCountryHistories(dbStates, dbUpdates);

    const updatePromises: Promise<void>[] = [];

    if (dbUpdates.orders.length > 0) {
      console.log('DB: Order Update');
      updatePromises.push(db.resolutionRepo.updateOrders(dbUpdates.orders));
    }

    if (Object.keys(dbUpdates.unitHistories).length > 0) {
      console.log('DB: Unit History Insert');
      updatePromises.push(db.resolutionRepo.insertUnitHistories(dbUpdates.unitHistories, turn.turnId));
    }

    if (Object.keys(dbUpdates.provinceHistories).length > 0) {
      console.log('DB: Province History Insert');
      updatePromises.push(db.resolutionRepo.insertProvinceHistories(dbUpdates.provinceHistories, turn.turnId));
    }

    if (Object.keys(dbUpdates.countryHistories).length > 0) {
      updatePromises.push(db.resolutionRepo.insertCountryHistories(dbUpdates.countryHistories, turn.turnId));
    }

    // Every turn
    updatePromises.push(db.resolutionRepo.updateOrderSets(dbUpdates.orderSets, turn.turnId));

    // Find next turn will require an updated gameState first
    console.log('DB: Turn Update'); // Pending resolution

    Promise.all(updatePromises).then(async () => {
      db.resolutionRepo.updateTurnProgress(turn.turnId, TurnStatus.RESOLVED);
      // Next turns needs to know retreats after resolution
      const changedGameState = await db.gameRepo.getGameState(turn.gameId);
      const nextTurns = this.schedulerService.findNextTurns(turn, changedGameState, unitsRetreating);

      // Ensures pending turn_id < preliminary turn_id for sequential get_last_history functions
      terminalLog('DB: Pending Turn Insert');
      db.gameRepo
        .insertNextTurn([
          gameState.gameId,
          nextTurns.pending.turnNumber,
          nextTurns.pending.turnName,
          nextTurns.pending.type,
          nextTurns.pending.yearNumber,
          TurnStatus.PENDING,
          nextTurns.pending.deadline
        ])
        .then(async (pendingTurn: NewTurn) => {
          this.schedulerService.scheduleTurn(pendingTurn.turnId, pendingTurn.deadline);
          await this.optionsService.saveOptionsForTurn(pendingTurn);

          if (nextTurns.preliminary) {
            terminalLog('DB: Preliminary Turn Insert');
            db.gameRepo
              .insertNextTurn([
                gameState.gameId,
                nextTurns.preliminary.turnNumber,
                nextTurns.preliminary.turnName,
                nextTurns.preliminary.type,
                nextTurns.preliminary.yearNumber,
                TurnStatus.PRELIMINARY,
                nextTurns.preliminary.deadline
              ])
              .then(async (preliminaryTurn: Turn) => {
                this.optionsService.saveOptionsForTurn(preliminaryTurn);
              });
          }
        });
    });
  }

  async resolveSpringRetreats(turn: UpcomingTurn): Promise<void> {
    const gameState: GameState = await db.gameRepo.getGameState(turn.gameId);
    const dbStates: DbStates = {
      game: {},
      turn: {},
      orderSets: [],
      orders: [],
      unitHistories: await db.gameRepo.getUnitHistories(turn.gameId, gameState.turnNumber),
      provinceHistories: await db.gameRepo.getProvinceHistories(turn.gameId, gameState.turnNumber),
      countryHistories: await db.gameRepo.getCountryHistories(turn.gameId, gameState.turnNumber)
    };

    // DB Update
    const dbUpdates: DbUpdates = {
      game: {},
      turn: {},
      orderSets: [],
      adjOrderSets: {},
      orders: [],
      adjustmentOrders: [],
      newUnits: [],
      unitHistories: {},
      provinceHistories: {},
      countryHistories: {},
      countryStatChanges: {}
    };

    const unitMovementResults: UnitOrderResolution[] = await this.resolveRetreatingUnitOrders(gameState, turn);

    unitMovementResults.forEach((result: UnitOrderResolution) => {
      if (result.orderId > 0) {
        dbUpdates.orders.push({
          orderId: result.orderId,
          orderStatus: OrderStatus.PROCESSED,
          orderSuccess: result.orderSuccess,
          power: result.power,
          description: result.description,
          primaryResolution: result.primaryResolution,
          secondaryResolution: result.secondaryResolution
        });
      }

      if (result.orderType === OrderDisplay.MOVE) {
        this.handleSpringMovement(result, dbStates, dbUpdates);
      }

      if (result.orderType === OrderDisplay.DISBAND) {
        this.handleDisband(result, dbStates, dbUpdates);
      }
    });

    this.revertContestedProvinces(dbStates.provinceHistories, dbUpdates.provinceHistories);

    this.prepareCountryHistories(dbStates, dbUpdates);

    const updatePromises: Promise<Turn | void>[] = [];

    if (dbUpdates.orders.length > 0) {
      console.log('DB: Order Update');
      updatePromises.push(db.resolutionRepo.updateOrders(dbUpdates.orders));
    }

    if (Object.keys(dbUpdates.unitHistories).length > 0) {
      console.log('DB: Unit History Insert');
      updatePromises.push(db.resolutionRepo.insertUnitHistories(dbUpdates.unitHistories, turn.turnId));
    }

    if (Object.keys(dbUpdates.provinceHistories).length > 0) {
      console.log('DB: Province History Insert');
      updatePromises.push(db.resolutionRepo.insertProvinceHistories(dbUpdates.provinceHistories, turn.turnId));
    }

    if (Object.keys(dbUpdates.countryHistories).length > 0) {
      updatePromises.push(db.resolutionRepo.insertCountryHistories(dbUpdates.countryHistories, turn.turnId));
    }

    updatePromises.push(db.resolutionRepo.updateOrderSets(dbUpdates.orderSets, turn.turnId));

    // Every turn

    // Find next turn will require an updated gameState first
    console.log('DB: Turn Update'); // Pending resolution
    updatePromises.push(db.resolutionRepo.updateTurnProgress(turn.turnId, TurnStatus.RESOLVED));

    if (!(gameState.preliminaryTurnId && gameState.preliminaryDeadline)) {
      terminalAddendum('Resolution', `Can't find preliminary turnId or deadline for game ${gameState.gameId}`);
      return;
    }
    const nowPendingTurnPromise = db.resolutionRepo.updateTurnProgress(
      gameState.preliminaryTurnId,
      TurnStatus.PENDING
    );
    this.schedulerService.scheduleTurn(gameState.preliminaryTurnId, gameState.preliminaryDeadline);
    updatePromises.push(nowPendingTurnPromise);
    const nowPendingTurn = await nowPendingTurnPromise;

    Promise.all(updatePromises).then(async () => {
      const retreatingCountryIds = dbStates.countryHistories
        .filter((countryHistory: CountryHistoryRow) => countryHistory.inRetreat)
        .map((countryHistory: CountryHistoryRow) => countryHistory.countryId);

      await this.optionsService.saveOptionsForTurn(nowPendingTurn, retreatingCountryIds);
    });
  }

  async resolveFallOrders(turn: UpcomingTurn): Promise<void> {
    const gameState: GameState = await db.gameRepo.getGameState(turn.gameId);
    const dbStates: DbStates = {
      game: {},
      turn: {},
      orderSets: [],
      orders: [],
      unitHistories: await db.gameRepo.getUnitHistories(turn.gameId, gameState.turnNumber),
      provinceHistories: await db.gameRepo.getProvinceHistories(turn.gameId, gameState.turnNumber),
      countryHistories: await db.gameRepo.getCountryHistories(turn.gameId, gameState.turnNumber)
    };

    // DB Update
    const dbUpdates: DbUpdates = {
      game: {},
      turn: {},
      orderSets: [],
      adjOrderSets: {},
      orders: [],
      adjustmentOrders: [],
      newUnits: [],
      unitHistories: {},
      provinceHistories: {},
      countryHistories: {},
      countryStatChanges: {}
    };

    let unitsRetreating = false;

    // dbStates.provinceHistories = await db.gameRepo.getProvinceHistories(turn.gameId, gameState.turnNumber);
    // dbStates.unitHistories = await db.gameRepo.getUnitHistories(turn.gameId, gameState.turnNumber);

    const unitMovementResults: UnitOrderResolution[] = await this.resolveUnitOrders(gameState, turn);

    unitMovementResults.forEach((result: UnitOrderResolution) => {
      if (result.orderId > 0) {
        dbUpdates.orders.push({
          orderId: result.orderId,
          orderStatus: OrderStatus.PROCESSED,
          orderSuccess: result.orderSuccess,
          power: result.power,
          description: result.description,
          primaryResolution: result.primaryResolution,
          secondaryResolution: result.secondaryResolution
        });
      }

      // Includes Province rows. Units don't have to be nuked. Striker always has eyes on nuked province
      if (result.orderType === OrderDisplay.NUKE) {
        this.handleNuclearStrike(result, dbStates, dbUpdates);
      }

      if (result.unit.status === UnitStatus.NUKED) {
        this.handleNuclearVictim(result, dbStates, dbUpdates);
      }

      // Includes province contesting
      if (result.orderType !== OrderDisplay.NUKE && result.unit.status !== UnitStatus.NUKED) {
        this.handleMovementResults(result, dbStates, dbUpdates, false, true);
      }

      if (result.unit.status === UnitStatus.RETREAT) {
        unitsRetreating = true;
        if (dbUpdates.countryHistories[result.unit.countryId]) {
          dbUpdates.countryHistories[result.unit.countryId].inRetreat = true;
        } else {
          const previousCountryHistory = dbStates.countryHistories.find(
            (countryHistory: CountryHistoryRow) => countryHistory.countryId === result.unit.countryId
          );

          if (!previousCountryHistory) {
            terminalAddendum(
              'Resolution',
              `Can't find unit ${result.unit.id} country by countryId ${result.unit.countryId}`
            );
            return;
          }

          dbUpdates.countryHistories[result.unit.countryId] = this.copyCountryHistory(previousCountryHistory);
          dbUpdates.countryHistories[result.unit.countryId].inRetreat = true;
        }
      }
    });

    // Cancel conflicts for retreats if there are no retreats
    if (!unitsRetreating) {
      this.revertContestedProvinces(dbStates.provinceHistories, dbUpdates.provinceHistories);
    }

    this.dissipateNukes(dbStates.unitHistories, dbUpdates.unitHistories);

    Object.values(dbUpdates.unitHistories).forEach((unitHistory: UnitHistoryRow) => {
      if (unitHistory.unitStatus === UnitStatus.FALLOUT) {
        unitHistory.falloutEndTurn = unitsRetreating ? turn.turnNumber + 1 : turn.turnNumber;
      }
    });

    this.prepareCountryHistories(dbStates, dbUpdates);

    const updatePromises: Promise<Turn | void>[] = [];

    if (dbUpdates.orders.length > 0) {
      console.log('DB: Order Update');
      updatePromises.push(db.resolutionRepo.updateOrders(dbUpdates.orders));
    }

    if (Object.keys(dbUpdates.unitHistories).length > 0) {
      console.log('DB: Unit History Insert');
      updatePromises.push(db.resolutionRepo.insertUnitHistories(dbUpdates.unitHistories, turn.turnId));
    }

    if (Object.keys(dbUpdates.provinceHistories).length > 0) {
      console.log('DB: Province History Insert');
      updatePromises.push(db.resolutionRepo.insertProvinceHistories(dbUpdates.provinceHistories, turn.turnId));
    }

    if (Object.keys(dbUpdates.countryHistories).length > 0) {
      updatePromises.push(db.resolutionRepo.insertCountryHistories(dbUpdates.countryHistories, turn.turnId));
    }

    // Every turn
    updatePromises.push(db.resolutionRepo.updateOrderSets(dbUpdates.orderSets, turn.turnId));

    // Find next turn will require an updated gameState first
    console.log('DB: Turn Update'); // Pending resolution
    updatePromises.push(db.resolutionRepo.updateTurnProgress(turn.turnId, TurnStatus.RESOLVED));

    Promise.all(updatePromises).then(async () => {
      // Next turns needs to know retreats after resolution
      const changedGameState = await db.gameRepo.getGameState(turn.gameId);
      const nextTurns = this.schedulerService.findNextTurns(turn, changedGameState, unitsRetreating);

      // Ensures pending turn_id < preliminary turn_id for sequential get_last_history functions
      terminalLog('DB: Pending Turn Insert');
      db.gameRepo
        .insertNextTurn([
          gameState.gameId,
          nextTurns.pending.turnNumber,
          nextTurns.pending.turnName,
          nextTurns.pending.type,
          nextTurns.pending.yearNumber,
          TurnStatus.PENDING,
          nextTurns.pending.deadline
        ])
        .then(async (pendingTurn: Turn) => {
          if (!pendingTurn.turnId) {
            terminalAddendum('Resolution', `Can't find turnId for ${pendingTurn.turnName}`);
            return;
          }
          this.schedulerService.scheduleTurn(pendingTurn.turnId, pendingTurn.deadline);

          if (nextTurns.preliminary) {
            await this.optionsService.saveOptionsForTurn(pendingTurn);

            db.gameRepo
              .insertNextTurn([
                gameState.gameId,
                nextTurns.preliminary.turnNumber,
                nextTurns.preliminary.turnName,
                nextTurns.preliminary.type,
                nextTurns.preliminary.yearNumber,
                TurnStatus.PRELIMINARY,
                nextTurns.preliminary.deadline
              ])
              .then(async (preliminaryTurn: Turn) => {
                await this.orderService.createAdjustmentDefaults(preliminaryTurn);
              });
          } else {
            await this.orderService.createAdjustmentDefaults(pendingTurn);
          }
        });
    });
  }

  async resolveFallRetreats(turn: UpcomingTurn): Promise<void> {
    const gameState: GameState = await db.gameRepo.getGameState(turn.gameId);
    const dbStates: DbStates = {
      game: {},
      turn: {},
      orderSets: [],
      orders: [],
      unitHistories: await db.gameRepo.getUnitHistories(turn.gameId, gameState.turnNumber),
      provinceHistories: await db.gameRepo.getProvinceHistories(turn.gameId, gameState.turnNumber),
      countryHistories: await db.gameRepo.getCountryHistories(turn.gameId, gameState.turnNumber)
    };

    // DB Update
    const dbUpdates: DbUpdates = {
      game: {},
      turn: {},
      orderSets: [],
      adjOrderSets: {},
      orders: [],
      adjustmentOrders: [],
      newUnits: [],
      unitHistories: {},
      provinceHistories: {},
      countryHistories: {},
      countryStatChanges: {}
    };

    const unitMovementResults: UnitOrderResolution[] = await this.resolveRetreatingUnitOrders(gameState, turn);

    unitMovementResults.forEach((result: UnitOrderResolution) => {
      if (result.orderId > 0) {
        dbUpdates.orders.push({
          orderId: result.orderId,
          orderStatus: OrderStatus.PROCESSED,
          orderSuccess: result.orderSuccess,
          power: result.power,
          description: result.description,
          primaryResolution: result.primaryResolution,
          secondaryResolution: result.secondaryResolution
        });
      }

      if (result.orderType === OrderDisplay.MOVE) {
        this.handleMovementResults(result, dbStates, dbUpdates, true, true);
      }

      if (result.orderType === OrderDisplay.DISBAND) {
        this.handleDisband(result, dbStates, dbUpdates);
      }
    });

    this.revertContestedProvinces(dbStates.provinceHistories, dbUpdates.provinceHistories);

    this.prepareCountryHistories(dbStates, dbUpdates);

    const updatePromises: Promise<Turn | void>[] = [];

    if (dbUpdates.orders.length > 0) {
      console.log('DB: Order Update');
      updatePromises.push(db.resolutionRepo.updateOrders(dbUpdates.orders));
    }

    if (Object.keys(dbUpdates.unitHistories).length > 0) {
      console.log('DB: Unit History Insert');
      updatePromises.push(db.resolutionRepo.insertUnitHistories(dbUpdates.unitHistories, turn.turnId));
    }

    if (Object.keys(dbUpdates.provinceHistories).length > 0) {
      console.log('DB: Province History Insert');
      updatePromises.push(db.resolutionRepo.insertProvinceHistories(dbUpdates.provinceHistories, turn.turnId));
    }

    if (Object.keys(dbUpdates.countryHistories).length > 0) {
      updatePromises.push(db.resolutionRepo.insertCountryHistories(dbUpdates.countryHistories, turn.turnId));
    }

    // Every turn
    updatePromises.push(db.resolutionRepo.updateOrderSets(dbUpdates.orderSets, turn.turnId));

    // Find next turn will require an updated gameState first
    console.log('DB: Turn Update'); // Pending resolution
    updatePromises.push(db.resolutionRepo.updateTurnProgress(turn.turnId, TurnStatus.RESOLVED));
    if (!(gameState.preliminaryTurnId && gameState.preliminaryDeadline)) {
      terminalAddendum('Resolution', `Can't find preliminary turnId or deadline for game ${gameState.gameId}`);
      return;
    }
    const nowPendingTurnPromise = db.resolutionRepo.updateTurnProgress(
      gameState.preliminaryTurnId,
      TurnStatus.PENDING
    );
    this.schedulerService.scheduleTurn(gameState.preliminaryTurnId, gameState.preliminaryDeadline);

    updatePromises.push(nowPendingTurnPromise);
    const nowPendingTurn = await nowPendingTurnPromise;

    Promise.all(updatePromises).then(async () => {
      const retreatingCountryIds = dbStates.countryHistories
        .filter((countryHistory: CountryHistoryRow) => countryHistory.inRetreat)
        .map((countryHistory: CountryHistoryRow) => countryHistory.countryId);

      await this.orderService.createAdjustmentDefaults(nowPendingTurn, retreatingCountryIds);
    });
  }

  async resolveAdjustments(turn: UpcomingTurn): Promise<void> {
    const gameState: GameState = await db.gameRepo.getGameState(turn.gameId);
    const dbStates: DbStates = {
      game: {},
      turn: {},
      orderSets: [],
      orders: [],
      unitHistories: await db.gameRepo.getUnitHistories(turn.gameId, gameState.turnNumber),
      provinceHistories: await db.gameRepo.getProvinceHistories(turn.gameId, gameState.turnNumber),
      countryHistories: await db.gameRepo.getCountryHistories(turn.gameId, gameState.turnNumber)
    };

    // DB Update
    const dbUpdates: DbUpdates = {
      game: {},
      turn: {},
      orderSets: [],
      adjOrderSets: {},
      orders: [],
      adjustmentOrders: [],
      newUnits: [],
      unitHistories: {},
      provinceHistories: {},
      countryHistories: {},
      countryStatChanges: {}
    };

    const remainingResources: Record<number, AdjustmentResolutionResources> = {};
    const newProvincesUsed: Set<string> = new Set<string>();

    dbStates.countryHistories.forEach((country: CountryHistoryRow) => {
      remainingResources[country.countryId] = {
        adjRemaining: country.adjustments,
        bbriDone: !(Number.isInteger(country.nukeRange) && country.bankedBuilds > 0),
        bbRemaining: country.bankedBuilds,
        disbandsDone: country.adjustments >= 0,
        nipRemaining: country.nukesInProduction
      };
    });

    // Countries do not interact with each other in the non-combat phases
    // They can all be internally validated
    // Check orders against options, then merge the arrays into the updates
    const adjResolutionData = await db.resolutionRepo.getAdjResolutionData(turn.gameId, turn.turnNumber, turn.turnId);

    adjResolutionData.forEach((adjOrder: AdjResolutionData) => {
      let historyChanged = false;
      const newCountryHistory = dbUpdates.countryHistories[adjOrder.countryId]
        ? dbUpdates.countryHistories[adjOrder.countryId]
        : dbStates.countryHistories.find((country: CountryHistoryRow) => country.countryId === adjOrder.countryId);
      const countryResources = remainingResources[adjOrder.countryId];

      if (!newCountryHistory) {
        terminalAddendum('ALERT', `Country ${adjOrder.countryId} not found in countryHistories`);
        return;
      }

      // Range Increases
      if (!countryResources.bbriDone) {
        if (adjOrder.increaseRange > 0 && adjOrder.increaseRange < countryResources.bbRemaining) {
          adjOrder.increaseRangeSuccess = true;
          newCountryHistory.nukeRange += adjOrder.increaseRange;
          countryResources.bbRemaining -= adjOrder.increaseRange;
          countryResources.bbriDone = true;
          historyChanged = true;
        }
      }

      // Disbands
      if (!countryResources.disbandsDone) {
        adjOrder.unitsDisbanding?.forEach((unit: UnitAndCountryIds) => {
          if (adjOrder.countryId === unit.countryId) {
            if (countryResources.adjRemaining < 0) {
              const unitHistoryDetails = dbUpdates.unitHistories[unit.unitId]
                ? dbUpdates.unitHistories[unit.unitId]
                : dbStates.unitHistories.find((unitHistory: UnitHistoryRow) => unitHistory.unitId === unit.unitId);

              if (!unitHistoryDetails) {
                terminalAddendum('ALERT', `Unit ${unit.unitId} not found in unitHistories`);
                return;
              }

              unitHistoryDetails.unitStatus = UnitStatus.DISBANDED_ADJUSTMENT;
              countryResources.adjRemaining++;
              newCountryHistory.adjustments++;

              dbUpdates.unitHistories[unitHistoryDetails.unitId] = unitHistoryDetails;

              if (countryResources.adjRemaining === 0) {
                countryResources.disbandsDone = true;
              }

              historyChanged = true;
            } else {
              terminalAddendum('Warning', `Too many units disbanding!`);
            }
          } else {
            terminalAddendum(
              'ALERT',
              `adjOrder.countryId (${adjOrder.countryId}) !== unit.countryId (${unit.countryId})`
            );
          }
        });
      }

      // Filters out stagnation
      if (adjOrder.buildType !== null) {
        // Requires Adjustment (Anything not placing a slow build nuke)
        if (countryResources.adjRemaining > 0) {
          // Requires Placement
          if (
            [BuildType.ARMY, BuildType.FLEET, BuildType.WING, BuildType.NUKE_RUSH, BuildType.NUKE_FINISH].includes(
              adjOrder.buildType
            )
          ) {
            if (adjOrder.countryId !== adjOrder.controllerId) {
              adjOrder.success = false;
              terminalAddendum(
                'ALERT',
                `Country ${adjOrder.countryId} is attempting to build at uncontrolled province ${adjOrder.provinceName}`
              );
            } else if (newProvincesUsed.has(adjOrder.provinceName)) {
              adjOrder.success = false;
              terminalAddendum(
                'ALERT',
                `Country ${adjOrder.countryId} has already built at ${adjOrder.provinceName} this turn!`
              );
            } else if (adjOrder.unitId !== null) {
              adjOrder.success = false;
              terminalAddendum('ALERT', `Country ${adjOrder.countryId} attempting build where unit already exists!`);
            } else {
              if ([BuildType.ARMY, BuildType.FLEET, BuildType.WING].includes(adjOrder.buildType)) {
                countryResources.adjRemaining--;
                newProvincesUsed.add(adjOrder.provinceName);
                adjOrder.success = true;
                newCountryHistory.unitCount++;
                newCountryHistory.adjustments--;
                historyChanged = true;

                dbUpdates.newUnits.push({
                  unitType: adjOrder.buildType,
                  countryId: adjOrder.countryId,
                  unitName: `${adjOrder.countryName} ${adjOrder.buildType} ${Math.ceil(Math.random() * 100000)}`, // To-Do?
                  turnId: turn.turnId,
                  nodeId: adjOrder.nodeId,
                  unitStatus: UnitStatus.ACTIVE
                });
              } else if (adjOrder.buildType === BuildType.NUKE_RUSH) {
                if (countryResources.bbRemaining > 0) {
                  countryResources.adjRemaining--;
                  countryResources.bbRemaining--;
                  newProvincesUsed.add(adjOrder.provinceName);
                  newCountryHistory.unitCount++;
                  newCountryHistory.adjustments--;
                  adjOrder.success = true;
                  historyChanged = true;

                  dbUpdates.newUnits.push({
                    unitType: UnitType.NUKE,
                    countryId: adjOrder.countryId,
                    unitName: `${adjOrder.countryName} ${UnitType.NUKE} ${Math.ceil(Math.random() * 100000)}`, // To-Do?
                    turnId: turn.turnId,
                    nodeId: adjOrder.nodeId,
                    unitStatus: UnitStatus.ACTIVE
                  });
                } else {
                  terminalAddendum(
                    'ALERT',
                    `BO ${adjOrder.buildOrderId} failure: Country ${adjOrder.countryId} attempting rush nuke with insufficient builds!`
                  );
                }
              }
            }
          }

          if (adjOrder.buildType === BuildType.BUILD) {
            countryResources.adjRemaining--;
            adjOrder.success = true;
            newCountryHistory.bankedBuilds++;
            historyChanged = true;

            newCountryHistory.bankedBuilds++;
          } else if (adjOrder.buildType === BuildType.RANGE) {
            if (Number.isInteger(adjOrder.nukeRange)) {
              countryResources.adjRemaining--;
              adjOrder.success = true;
              newCountryHistory.nukeRange++;
              historyChanged = true;

              newCountryHistory.nukeRange++;
            } else {
              terminalAddendum('ALERT', `Country ${adjOrder.countryId} attempting increase nuke range without tech!`);
            }
          } else if (adjOrder.buildType === BuildType.NUKE_START) {
            if (Number.isInteger(adjOrder.nukeRange)) {
              countryResources.adjRemaining--;
              adjOrder.success = true;
              newCountryHistory.unitCount++;
              newCountryHistory.adjustments--;
              historyChanged = true;

              newCountryHistory.nukesInProduction++;
            } else {
              terminalAddendum('ALERT', `Country ${adjOrder.countryId} attempting build a nuke without tech!`);
            }
          }
        }

        // Nukes finishing
        if (adjOrder.buildType === BuildType.NUKE_FINISH) {
          if (countryResources.nipRemaining > 0) {
            if (Number.isInteger(adjOrder.nukeRange)) {
              countryResources.nipRemaining--;
              newCountryHistory.nukesInProduction--;
              adjOrder.success = true;

              dbUpdates.newUnits.push({
                unitType: UnitType.NUKE,
                countryId: adjOrder.countryId,
                unitName: `${adjOrder.countryId} ${UnitType.NUKE} ${Math.ceil(Math.random() * 100000)}`, // To-Do?
                turnId: turn.turnId,
                nodeId: adjOrder.nodeId,
                unitStatus: UnitStatus.ACTIVE
              });
            } else {
              terminalAddendum('ALERT', `Country ${adjOrder.countryId} attempting finish a slow nuke without tech?!?`);
              adjOrder.success = false;
            }
          } else {
            terminalAddendum('ALERT', `Country ${adjOrder.countryId} finish a nuke not in production!`);
            adjOrder.success = false;
          }
        }
      }

      if (historyChanged) {
        dbUpdates.countryHistories[adjOrder.countryId] = newCountryHistory;
      }

      dbUpdates.adjustmentOrders.push({
        buildOrderId: adjOrder.buildOrderId,
        orderSetId: adjOrder.orderSetId,
        nodeId: adjOrder.nodeId,
        buildType: adjOrder.buildType,
        success: adjOrder.success
      });
    });

    this.dissipateNukes(dbStates.unitHistories, dbUpdates.unitHistories);

    const promises: Promise<void>[] = [];

    if (dbUpdates.adjustmentOrders.length > 0) {
      console.log('DB: Updating Adjustment Orders');
      promises.push(db.resolutionRepo.updateAdjustmentOrders(dbUpdates.adjustmentOrders));
    }

    // if (dbUpdates.orderSets.length > 0) {
    //   for (let orderSet in dbUpdates.adjOrderSets) {
    //     promises.push(db.resolutionRepo.updateOrderSets(dbUpdates.adjOrderSets));
    //   }
    // }

    if (dbUpdates.newUnits.length > 0) {
      console.log('DB: New Units Insert');
      promises.push(db.resolutionRepo.insertNewUnit(dbUpdates.newUnits, turn.turnId));
    }

    if (Object.keys(dbUpdates.unitHistories).length > 0) {
      console.log('DB: Unit History Insert');
      promises.push(db.resolutionRepo.insertUnitHistories(dbUpdates.unitHistories, turn.turnId));
    }

    if (Object.keys(dbUpdates.countryHistories).length > 0) {
      promises.push(db.resolutionRepo.insertCountryHistories(dbUpdates.countryHistories, turn.turnId));
    }

    Promise.all(promises).then(async () => {
      // Find next turn will require an updated gameState first
      console.log('DB: Turn Update'); // Pending resolution
      db.resolutionRepo.updateTurnProgress(turn.turnId, TurnStatus.RESOLVED).then(async () => {
        // Next turns needs to know retreats after resolution
        const changedGameState = await db.gameRepo.getGameState(turn.gameId);
        const nextTurns = this.schedulerService.findNextTurns(turn, changedGameState, false);

        // Ensures pending turn_id < preliminary turn_id for sequential get_last_history functions
        terminalLog('DB: Pending Turn Insert');
        db.gameRepo
          .insertNextTurn([
            gameState.gameId,
            nextTurns.pending.turnNumber,
            nextTurns.pending.turnName,
            nextTurns.pending.type,
            nextTurns.pending.yearNumber,
            TurnStatus.PENDING,
            nextTurns.pending.deadline
          ])
          .then(async (pendingTurn: NewTurn) => {
            this.schedulerService.scheduleTurn(pendingTurn.turnId, pendingTurn.deadline);

            if (pendingTurn.turnType === TurnType.NOMINATIONS) {
              await this.orderService.initializeNominationOrderSets(pendingTurn);
            }

            if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
              await this.optionsService.saveOptionsForTurn(pendingTurn);
            }

            if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
              const validNominations = await this.validateNominations(turn, gameState);
              db.ordersRepo.insertNominations(validNominations, pendingTurn.turnId);
            }

            if (pendingTurn.turnType === TurnType.VOTES) {
              await this.orderService.initializeVotingOrderSets(pendingTurn);
            }

            if (nextTurns.preliminary) {
              // If prelim exists, pending = Nominations and prelim = Spring Orders
              // Won't need to default any options for Nominations?!

              db.gameRepo
                .insertNextTurn([
                  gameState.gameId,
                  nextTurns.preliminary.turnNumber,
                  nextTurns.preliminary.turnName,
                  nextTurns.preliminary.type,
                  nextTurns.preliminary.yearNumber,
                  TurnStatus.PRELIMINARY,
                  nextTurns.preliminary.deadline
                ])
                .then(async (preliminaryTurn: Turn) => {
                  await this.optionsService.saveOptionsForTurn(preliminaryTurn);
                });
            }
          });
      });
    });
  }

  async resolveNominations(turn: UpcomingTurn): Promise<void> {
    const gameState = await db.gameRepo.getGameState(turn.gameId);
    const nextTurns = this.schedulerService.findNextTurns(turn, gameState, false);

    const validNominations = await this.validateNominations(turn, gameState);

    // Ensures pending turn_id < preliminary turn_id for sequential get_last_history functions
    terminalLog('DB: Pending Turn Insert');
    db.gameRepo
      .insertNextTurn([
        turn.gameId,
        nextTurns.pending.turnNumber,
        nextTurns.pending.turnName,
        nextTurns.pending.type,
        nextTurns.pending.yearNumber,
        TurnStatus.PENDING,
        nextTurns.pending.deadline
      ])
      .then(async (pendingTurn: NewTurn) => {
        this.schedulerService.scheduleTurn(pendingTurn.turnId, pendingTurn.deadline);

        // If prelim,  pending = Votes, prelim = Spring Orders
        // If !prelim, pending = Spring Orders and Votes
        await this.orderService.initializeVotingOrderSets(pendingTurn);
        db.ordersRepo.insertNominations(validNominations, pendingTurn.turnId).then(async () => {
          db.resolutionRepo.updateTurnProgress(turn.turnId, TurnStatus.RESOLVED);
        });

        if (nextTurns.preliminary) {
          db.gameRepo
            .insertNextTurn([
              turn.gameId,
              nextTurns.preliminary.turnNumber,
              nextTurns.preliminary.turnName,
              nextTurns.preliminary.type,
              nextTurns.preliminary.yearNumber,
              TurnStatus.PRELIMINARY,
              nextTurns.preliminary.deadline
            ])
            .then(async (preliminaryTurn: Turn) => {
              await this.optionsService.saveOptionsForTurn(preliminaryTurn);
            });
        }
      });
  }

  async resolveVotes(turn: UpcomingTurn): Promise<void> {
    const globalVotes = await db.ordersRepo.getVotesForResolution(turn);
    const nominations = await db.optionsRepo.getNominations(turn.turnId);

    const nominationLibrary: Record<number, Nomination> = {};
    nominations.forEach((nomination: Nomination) => {
      nominationLibrary[nomination.nominationId] = nomination;
    });

    globalVotes.forEach((countryVotes: CountryVotes) => {
      countryVotes.votes?.forEach((vote: number) => {
        const nomination = nominationLibrary[vote];
        if (nomination) {
          nomination.yayVoterIds.push(countryVotes.countryId);
          nomination.votesReceived += countryVotes.voteCount;
        }
      });
    });

    let winningNominationId: number | undefined;
    let winningDiff = -1;

    nominations.forEach((nomination: Nomination) => {
      nomination.winDiff = nomination.votesReceived - nomination.votesRequired;
      if (nomination.winDiff > winningDiff) {
        winningNominationId = nomination.nominationId;
        winningDiff = nomination.winDiff;
      }
    });

    if (winningNominationId) {
      // Game Over
      nominationLibrary[winningNominationId].winner = true;

      const gameState = await db.gameRepo.getGameState(turn.gameId);
      db.resolutionRepo.updateTurnProgress(turn.turnId, TurnStatus.FINAL);
      if (turn.turnType === TurnType.VOTES && gameState.preliminaryTurnId) {
        db.resolutionRepo.updateTurnProgress(gameState.preliminaryTurnId, TurnStatus.CANCELLED);
      }
    } else if (turn.turnType === TurnType.VOTES) {
      // Continue
      const gameState = await db.gameRepo.getGameState(turn.gameId);
      db.resolutionRepo.updateTurnProgress(turn.turnId, TurnStatus.RESOLVED);
      if (gameState.preliminaryTurnId && gameState.preliminaryDeadline) {
        db.resolutionRepo.updateTurnProgress(gameState.preliminaryTurnId, TurnStatus.PENDING);
        this.schedulerService.scheduleTurn(gameState.preliminaryTurnId, gameState.preliminaryDeadline);
      }
    } else {
      this.resolveSpringOrders(turn);
    }

    db.resolutionRepo.saveVoteResults(nominations);
  }

  async resolveUnitOrders(gameState: GameState, turn: UpcomingTurn): Promise<UnitOrderResolution[]> {
    const unitOptions = this.optionsService.finalizeUnitOptions(
      await db.optionsRepo.getUnitOptions(gameState.gameId, gameState.turnNumber, turn.turnId, 0),
      turn.turnType
    );

    const unitOrders: UnitOrderResolution[] = await db.resolutionRepo.getUnitOrdersForResolution(
      gameState.gameId,
      gameState.turnNumber,
      turn.turnId
    );

    const remainingGarrisons: UnitOrderResolution[] = await db.resolutionRepo.getRemainingGarrisons(
      gameState.gameId,
      gameState.turnNumber
    );

    unitOrders.push(...remainingGarrisons);

    const orderGroups: UnitOrderGroups = {
      transport: [],
      hold: [],
      invalid: [],
      move: [],
      moveTransported: [],
      nuke: [],
      support: []
    };

    // If transported unit attempts, add key with initial link
    // Recursively expand all potential paths given compliant transports
    const transportAttempts: Record<string, TransportAttempt> = {};

    // For changes to province histories after resolution
    // const provinceEvents: ProvinceEvents = {
    //   contested: [],
    //   nuked: []
    // };
    // const contestedProvinces: ProvinceHistoryRow[] = [];

    // Otherwise successful orders become invalid and fail should these orders fail
    const dependencies: OrderDependencies = {
      dependency: {},
      heads: []
    };

    // Successful orders get description updates should these orders fail
    const supremacies: Record<string, OrderSupremacy> = {};

    // Order Possibility Verification
    unitOrders.forEach((order: UnitOrderResolution) => {
      this.sortAndValidateUnitOrder(order, unitOptions, orderGroups);
    });

    // Nukes detonate or invalidate if self-targetting
    // Will include MAD orders, some day
    orderGroups.nuke.forEach((order: UnitOrderResolution) => {
      this.resolveNuclearLaunch(order, unitOrders);
    });

    // Support Cuts and Compliance
    orderGroups.support
      .filter((order: UnitOrderResolution) => order.unit.status === UnitStatus.ACTIVE)
      .forEach((order: UnitOrderResolution) => {
        this.resolveSupport(order, unitOrders, dependencies);
      });

    // Convoy Compliance and success
    if (orderGroups.transport.length > 0 || orderGroups.moveTransported.length > 0) {
      const transportNetwork: TransportNetworkUnit[] = await db.resolutionRepo.getTransportNetworkInfo(
        gameState.gameId,
        gameState.turnNumber
      );

      // Stores filter logic for DRY operation
      const activeMoveTransported = orderGroups.moveTransported.filter(
        (order: UnitOrderResolution) => order.unit.status === UnitStatus.ACTIVE
      );
      const activeTransports = orderGroups.transport.filter(
        (order: UnitOrderResolution) => order.unit.status === UnitStatus.ACTIVE
      );

      // Creates full paths of all fully compliant routes
      activeMoveTransported.forEach((moveTransportedOrder: UnitOrderResolution) => {
        this.createTransportPaths(moveTransportedOrder, orderGroups.transport, transportNetwork, transportAttempts);
      });

      // Checks carried unit compliance and full path existence for transports
      activeTransports.forEach((transportOrder: UnitOrderResolution) => {
        const attemptKey = `${transportOrder.secondaryUnit.id}-${transportOrder.destination.nodeId}`;
        if (!transportAttempts[attemptKey]) {
          transportOrder.valid = false;
          transportOrder.primaryResolution = `Invalid Order: Noncompliance`;
        } else if (transportAttempts[attemptKey].paths.length === 0) {
          transportOrder.valid = false;
          transportOrder.primaryResolution = `Invalid Order: Insufficient Compliance`;
        } else {
          this.checkTransportSuccess(transportOrder, orderGroups.move);
        }
      });
    }

    // Movement
    const unresolvedMovement = orderGroups.move.filter(
      (order: UnitOrderResolution) => order.unit.status === UnitStatus.ACTIVE
    );
    const moveTransported = orderGroups.moveTransported.filter(
      (order: UnitOrderResolution) => order.unit.status === UnitStatus.ACTIVE
    );
    unresolvedMovement.push(...moveTransported);

    unresolvedMovement.forEach((order: UnitOrderResolution) => {
      this.resolveMovement(order, unitOrders, dependencies, supremacies, transportAttempts);
    });

    orderGroups.hold.forEach((holdOrder: UnitOrderResolution) => {
      this.resolveHold(holdOrder, unitOrders);
    });

    this.checkDependencies(dependencies, unitOrders);
    this.checkSupremacies(supremacies);

    return unitOrders;
  }

  async resolveRetreatingUnitOrders(gameState: GameState, turn: UpcomingTurn): Promise<UnitOrderResolution[]> {
    const unitOptions = this.optionsService.finalizeUnitOptions(
      await db.optionsRepo.getRetreatingUnitOptions(gameState.gameId, gameState.turnNumber, turn.turnId, 0),
      turn.turnType
    );

    const unitOrders: UnitOrderResolution[] = await db.resolutionRepo.getUnitOrdersForResolution(
      gameState.gameId,
      gameState.turnNumber,
      turn.turnId
    );

    const remainingGarrisons: UnitOrderResolution[] = await db.resolutionRepo.getRemainingGarrisons(
      gameState.gameId,
      gameState.turnNumber
    );

    unitOrders.push(...remainingGarrisons);

    const orderGroups: UnitOrderGroups = {
      hold: [],
      disband: [],
      move: [],
      moveTransported: [],
      transport: [],
      support: [],
      nuke: [],
      invalid: []
    };

    // Order Possibility Verification
    unitOrders.forEach((order: UnitOrderResolution) => {
      this.sortAndValidateUnitOrder(order, unitOptions, orderGroups);
    });

    // Movement
    const unresolvedMovement = orderGroups.move.filter(
      (order: UnitOrderResolution) => order.unit.status === UnitStatus.RETREAT
    );

    unresolvedMovement.forEach((order: UnitOrderResolution) => {
      this.resolveRetreatingMovement(order, unitOrders);
    });

    orderGroups.disband?.forEach((disbandOrder: UnitOrderResolution) => {
      disbandOrder.orderSuccess = true;
      disbandOrder.primaryResolution = 'Retreated off the map';
    });

    return unitOrders;
  }

  sortAndValidateUnitOrder(
    order: UnitOrderResolution,
    unitOptions: UnitOptionsFinalized[],
    orderGroups: UnitOrderGroups
  ): void {
    const options: UnitOptionsFinalized | undefined = unitOptions.find(
      (option: UnitOptionsFinalized) => option.unitId === order.unit.id
    );

    if (options === undefined) {
      if (order.unit.type !== UnitType.GARRISON) {
        terminalLog(
          `orderId ${order.orderId} with unitId ${order.unit.id} doesn't even have matching options. This should be impossible but here we are!`
        );

        this.invalidateOrder(order, `Incredibly Invalid`);
      }
    } else if (!options.orderTypes.includes(order.orderType)) {
      this.invalidateOrder(order, `Invalid Order Type`);
    } else if (order.orderType === OrderDisplay.HOLD) {
      orderGroups.hold.push(order);
    } else if (order.orderType === OrderDisplay.DISBAND) {
      orderGroups.disband?.push(order);
    } else if (order.orderType === OrderDisplay.MOVE) {
      const destinationIds = options.moveDestinations.map((destination: OptionDestination) => destination.nodeId);

      if (!destinationIds.includes(order.destination.nodeId)) {
        this.invalidateOrder(order, `Invalid Destination`);
      } else {
        orderGroups.move.push(order);
      }
    } else if (order.orderType === OrderDisplay.MOVE_CONVOYED) {
      const destinationIds = options.moveTransportedDestinations.map(
        (destination: OptionDestination) => destination.nodeId
      );

      if (!destinationIds.includes(order.destination.nodeId)) {
        this.invalidateOrder(order, `Invalid Destination`);
      } else {
        orderGroups.moveTransported.push(order);
      }
    } else if (order.orderType === OrderDisplay.NUKE) {
      const targetIds = options.nukeTargets.map((destination: OptionDestination) => destination.nodeId);

      if (!targetIds.includes(order.destination.nodeId)) {
        this.invalidateOrder(order, `Invalid Target`);
      } else {
        orderGroups.nuke.push(order);
      }
    } else if (order.orderType === OrderDisplay.SUPPORT) {
      const supportableUnitIds = options.supportStandardUnits.map((unit: SecondaryUnit) => unit.id);

      if (!supportableUnitIds.includes(order.secondaryUnit.id)) {
        this.invalidateOrder(order, 'Invalid Support Unit');
      } else {
        const supportDestinationIds = options.supportStandardDestinations[order.secondaryUnit.id].map(
          (destination: OptionDestination) => destination.nodeId
        );

        if (!supportDestinationIds.includes(order.destination.nodeId)) {
          this.invalidateOrder(order, 'Invalid Support Destination');
        } else {
          orderGroups.support.push(order);
        }
      }
    } else if (order.orderType === OrderDisplay.SUPPORT_CONVOYED) {
      const supportableUnitIds = options.supportTransportedUnits.map((unit: SecondaryUnit) => unit.id);

      if (!supportableUnitIds.includes(order.secondaryUnit.id)) {
        this.invalidateOrder(order, 'Invalid Support Unit');
      } else {
        const supportDestinationIds = options.supportTransportedDestinations[order.secondaryUnit.id].map(
          (destination: OptionDestination) => destination.nodeId
        );

        if (!supportDestinationIds.includes(order.destination.nodeId)) {
          this.invalidateOrder(order, 'Invalid Support Destination');
        } else {
          orderGroups.support.push(order);
        }
      }
    } else if ([OrderDisplay.AIRLIFT, OrderDisplay.CONVOY].includes(order.orderType)) {
      const transportableUnitIds = options.transportableUnits.map((unit: SecondaryUnit) => unit.id);

      if (!transportableUnitIds.includes(order.secondaryUnit.id)) {
        this.invalidateOrder(order, `Invalid ${order.orderType} Unit`);
      } else {
        const transportDestinationIds = options.transportDestinations[order.secondaryUnit.id].map(
          (destination: OptionDestination) => destination.nodeId
        );

        if (!transportDestinationIds.includes(order.destination.nodeId)) {
          this.invalidateOrder(order, `Invalid ${order.orderType} Destination`);
        } else {
          orderGroups.transport.push(order);
        }
      }
    }

    order.valid = true;
  }

  sortAndValidateRetreatingUnitOrder(
    order: UnitOrderResolution,
    unitOptions: UnitOptionsFinalized[],
    orderGroups: UnitOrderGroups
  ): void {
    const options: UnitOptionsFinalized | undefined = unitOptions.find(
      (option: UnitOptionsFinalized) => option.unitId === order.unit.id
    );

    if (options === undefined) {
      if (order.unit.type !== UnitType.GARRISON) {
        terminalLog(
          `orderId ${order.orderId} with unitId ${order.unit.id} doesn't even have matching options. This should be impossible but here we are!`
        );

        this.invalidateOrder(order, `Incredibly Invalid`);
      }
    } else if (!options.orderTypes.includes(order.orderType)) {
      this.invalidateOrder(order, `Invalid Order Type`);
    } else if (order.orderType === OrderDisplay.HOLD) {
      orderGroups.hold.push(order);
    } else if (order.orderType === OrderDisplay.MOVE) {
      const destinationIds = options.moveDestinations.map((destination: OptionDestination) => destination.nodeId);

      if (!destinationIds.includes(order.destination.nodeId)) {
        this.invalidateOrder(order, `Invalid Destination`);
      } else {
        orderGroups.move.push(order);
      }
    } else if (order.orderType === OrderDisplay.MOVE_CONVOYED) {
      const destinationIds = options.moveTransportedDestinations.map(
        (destination: OptionDestination) => destination.nodeId
      );

      if (!destinationIds.includes(order.destination.nodeId)) {
        this.invalidateOrder(order, `Invalid Destination`);
      } else {
        orderGroups.moveTransported.push(order);
      }
    } else if (order.orderType === OrderDisplay.NUKE) {
      const targetIds = options.nukeTargets.map((destination: OptionDestination) => destination.nodeId);

      if (!targetIds.includes(order.destination.nodeId)) {
        this.invalidateOrder(order, `Invalid Target`);
      } else {
        orderGroups.nuke.push(order);
      }
    } else if (order.orderType === OrderDisplay.SUPPORT) {
      const supportableUnitIds = options.supportStandardUnits.map((unit: SecondaryUnit) => unit.id);

      if (!supportableUnitIds.includes(order.secondaryUnit.id)) {
        this.invalidateOrder(order, 'Invalid Support Unit');
      } else {
        const supportDestinationIds = options.supportStandardDestinations[order.secondaryUnit.id].map(
          (destination: OptionDestination) => destination.nodeId
        );

        if (!supportDestinationIds.includes(order.destination.nodeId)) {
          this.invalidateOrder(order, 'Invalid Support Destination');
        } else {
          orderGroups.support.push(order);
        }
      }
    } else if (order.orderType === OrderDisplay.SUPPORT_CONVOYED) {
      const supportableUnitIds = options.supportTransportedUnits.map((unit: SecondaryUnit) => unit.id);

      if (!supportableUnitIds.includes(order.secondaryUnit.id)) {
        this.invalidateOrder(order, 'Invalid Support Unit');
      } else {
        const supportDestinationIds = options.supportTransportedDestinations[order.secondaryUnit.id].map(
          (destination: OptionDestination) => destination.nodeId
        );

        if (!supportDestinationIds.includes(order.destination.nodeId)) {
          this.invalidateOrder(order, 'Invalid Support Destination');
        } else {
          orderGroups.support.push(order);
        }
      }
    } else if ([OrderDisplay.AIRLIFT, OrderDisplay.CONVOY].includes(order.orderType)) {
      const transportableUnitIds = options.transportableUnits.map((unit: SecondaryUnit) => unit.id);

      if (!transportableUnitIds.includes(order.secondaryUnit.id)) {
        this.invalidateOrder(order, `Invalid ${order.orderType} Unit`);
      } else {
        const transportDestinationIds = options.transportDestinations[order.secondaryUnit.id].map(
          (destination: OptionDestination) => destination.nodeId
        );

        if (!transportDestinationIds.includes(order.destination.nodeId)) {
          this.invalidateOrder(order, `Invalid ${order.orderType} Destination`);
        } else {
          orderGroups.transport.push(order);
        }
      }
    }

    order.valid = true;
  }

  invalidateOrder(order: UnitOrderResolution, failureDescription: string) {
    order.valid = false;
    order.primaryResolution = failureDescription;
    // order.orderType = OrderDisplay.HOLD;
    // order.destination = {
    //   id: 0,
    //   provinceId: 0,
    //   provinceName: 'Invalid',
    //   nodeName: 'Invalid',
    //   nodeType: 'Invalid'
    // };
  }

  resolveNuclearLaunch(order: UnitOrderResolution, orders: UnitOrderResolution[]) {
    const victim: UnitOrderResolution | undefined = orders.find(
      (victim: UnitOrderResolution) => victim.origin.provinceId === order.destination.provinceId
    );

    if (victim && victim.unit.countryId === order.unit.countryId) {
      order.valid = false;
      order.primaryResolution = `Invalid order: No self nuking`;
    } else {
      order.orderSuccess = true;
      order.unit.status = UnitStatus.FALLOUT;
    }

    if (victim && victim.unit.countryId !== order.unit.countryId) {
      victim.unit.status = UnitStatus.NUKED;
      victim.primaryResolution = `Invalid order: Nuked`;
    }
  }

  /**
   * Checks compliance, cuts, risk of self-dislodge.
   * @param order
   * @param orders
   */
  resolveSupport(order: UnitOrderResolution, orders: UnitOrderResolution[], dependencies: OrderDependencies) {
    const supportedUnit: UnitOrderResolution | undefined = orders.find(
      (unit: UnitOrderResolution) => unit.unit.id === order.secondaryUnit.id
    );
    if (supportedUnit) {
      if (supportedUnit.destination.nodeId !== order.destination.nodeId) {
        order.primaryResolution = `Invalid Order: Noncompliance`;
        return;
      }

      if (supportedUnit.unit.status === UnitStatus.NUKED) {
        order.valid = false;
        order.orderSuccess = false;
        order.primaryResolution = `Invalid Order: Supported Unit Nuked`;
        return;
      }

      const destinationNuked = orders.find(
        (strike: UnitOrderResolution) =>
          strike.orderType === OrderDisplay.NUKE && strike.destination.provinceId === order.destination.provinceId
      );
      if (destinationNuked) {
        order.valid = false;
        order.orderSuccess = false;
        order.primaryResolution = `Invalid Order: Can't Support Into Nuclear Fallout`;
        return;
      }

      const validCuts = orders.filter(
        (attack: UnitOrderResolution) =>
          attack.destination.provinceId === order.origin.provinceId &&
          attack.unit.countryId !== order.unit.countryId &&
          attack.origin.provinceId !== supportedUnit.destination.provinceId
      );

      if (validCuts.length > 0) {
        order.primaryResolution = order.primaryResolution
          ? `${order.primaryResolution}. Failed: Support Cut`
          : 'Failed: Support Cut';
        order.supportCut = true;
      }

      if (!order.supportCut) {
        const defender: UnitOrderResolution | undefined = orders.find(
          (defender: UnitOrderResolution) => defender.origin.provinceId === order.destination.provinceId
        );
        if (defender) {
          if (
            [
              OrderDisplay.HOLD,
              OrderDisplay.AIRLIFT,
              OrderDisplay.CONVOY,
              OrderDisplay.SUPPORT,
              OrderDisplay.SUPPORT_CONVOYED
            ].includes(defender.orderType) &&
            defender.unit.countryId === order.unit.countryId
          ) {
            order.valid = false;
            order.primaryResolution = `Invalid Order: Can't Self-Dislodge`;
          }

          if (
            [OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(defender.orderType) &&
            defender.unit.countryId === order.unit.countryId &&
            order.valid
          ) {
            this.setDependency(dependencies, order.orderId, defender.orderId, `Can't Self-Dislodge`);
          }
        }

        if (order.valid && !order.supportCut) {
          order.orderSuccess = true;
          supportedUnit.power++;
          order.primaryResolution = `Supported Unit Power: ${supportedUnit.power}`;
        }
      } else {
        this.resolveHold(order, orders, true);
      }
    }
  }

  setDependency(dependencies: OrderDependencies, orderId: number, dependendentId: number, description: string) {
    dependencies.dependency[dependendentId] = {
      orderId: orderId,
      description: description
    };
    const depIndex = dependencies.heads.indexOf(orderId);
    if (depIndex > -1) {
      dependencies.heads[depIndex] = dependendentId;
    } else {
      dependencies.heads.push(dependendentId);
    }
  }

  // setSupremacy(supremacies: Record<string, OrderSupremacy>, orderId: number, secondaryOrderId: number, description: string) {
  //   supremacies[orderId] = {
  //     orderId: orderId,
  //     secondaryOrderId: secondaryOrderId,
  //     description: description
  //   };
  // }

  createTransportPaths(
    order: UnitOrderResolution,
    transportOrders: UnitOrderResolution[],
    transportNetwork: TransportNetworkUnit[],
    transportAttempts: Record<string, TransportAttempt>
  ) {
    const attemptId = `${order.unit.id}-${order.destination.nodeId}`;
    transportAttempts[attemptId] = {
      success: false,
      paths: []
    };

    const compliantTransportsIds = transportOrders
      .filter(
        (transport: UnitOrderResolution) =>
          transport.secondaryUnit.id === order.unit.id && transport.destination.nodeId === order.destination.nodeId
      )
      .map((transport: UnitOrderResolution) => transport.unit.id);

    const compliantTransports = transportNetwork.filter((transport: TransportNetworkUnit) =>
      compliantTransportsIds.includes(transport.unitId)
    );

    let initialTransportIds = transportNetwork
      .find((transported: TransportNetworkUnit) => transported.unitId === order.unit.id)
      ?.transports.map((transport: AdjacentTransport) => transport.unitId);

    if (initialTransportIds === undefined) {
      initialTransportIds = [];
    }

    initialTransportIds.forEach((transportId: number) => {
      this.extendTransportPath(transportId, [], order, compliantTransports, transportAttempts[attemptId]);
    });
  }

  extendTransportPath(
    currentLinkId: number,
    committed: number[],
    order: UnitOrderResolution,
    compliantTransports: TransportNetworkUnit[],
    transportAttempt: TransportAttempt
  ) {
    const currentTransport = compliantTransports.find(
      (transport: TransportNetworkUnit) => transport.unitId === currentLinkId
    );
    if (currentTransport) {
      const newCommitted = committed.slice();
      newCommitted.push(currentLinkId);

      const destination = currentTransport.destinations.find(
        (destination: TransportDestination) => destination.nodeId === order.destination.nodeId
      );
      if (destination) {
        if (transportAttempt.paths) {
          transportAttempt.paths.push({
            transports: newCommitted,
            success: true
          });
        } else {
          transportAttempt.paths = [
            {
              transports: newCommitted,
              success: true
            }
          ];
        }
      } else {
        const nextTransports = this.getNextTransports(order.unit.id, newCommitted, compliantTransports);
        nextTransports.forEach((transportId: number) => {
          this.extendTransportPath(transportId, newCommitted, order, compliantTransports, transportAttempt);
        });
      }
    }
  }

  getNextTransports(
    currentUnitId: number,
    committedTransportIds: number[],
    compliantTransports: TransportNetworkUnit[]
  ): number[] {
    const nextTransports = compliantTransports
      .find((transport: TransportNetworkUnit) => transport.unitId === currentUnitId)
      ?.transports.filter((transport: AdjacentTransport) => !committedTransportIds.includes(transport.unitId))
      .map((transport: AdjacentTransport) => transport.unitId);

    return nextTransports ? nextTransports : [];
  }

  /**
   * Primary difference between convoy success and move success is that convoys are non-transported only.
   * This prevents.
   */
  checkTransportSuccess(transportOrder: UnitOrderResolution, moveStandardOrders: UnitOrderResolution[]) {
    const challengers = moveStandardOrders.filter(
      (challengingOrder: UnitOrderResolution) =>
        challengingOrder.destination.nodeId === transportOrder.origin.nodeId && challengingOrder.valid
    );

    if (challengers.length === 0) {
      transportOrder.orderSuccess = true;
      transportOrder.primaryResolution = `Success`;
      return;
    }

    const challenges: Record<number, number[]> = {};
    let maxPower = transportOrder.power;
    let winningChallenger: UnitOrderResolution = challengers[0];
    challengers.forEach((challenger: UnitOrderResolution) => {
      if (challenges[challenger.power]) {
        challenges[challenger.power].push(challenger.unit.id);
      } else {
        challenges[challenger.power] = [challenger.unit.id];
      }

      if (challenger.power > maxPower) {
        maxPower = challenger.power;
        winningChallenger = challenger;
      }
    });

    const transportPowerSummary = this.createTransportPowerConflictSummary(transportOrder.power, challenges, maxPower);

    if (maxPower > transportOrder.power && challenges[maxPower].length === 1) {
      transportOrder.orderSuccess = false;
      transportOrder.primaryResolution = `Hold Failed: ${transportPowerSummary}`;
      transportOrder.unit.status = UnitStatus.RETREAT;
      transportOrder.displacerProvinceId = winningChallenger.origin.provinceId;
    } else if (maxPower > transportOrder.power) {
      transportOrder.orderSuccess = true;
      transportOrder.primaryResolution = `Hold Victory: Bouncing Challengers ${transportPowerSummary}`;
    } else if (maxPower === transportOrder.power) {
      transportOrder.orderSuccess = true;
      transportOrder.primaryResolution = `Hold Victory: ${transportPowerSummary}`;
    }

    challengers.forEach((challenger: UnitOrderResolution) => {
      this.resolveTransportChallenge(transportOrder.power, challenger, challenges, maxPower);
    });
  }

  createTransportPowerConflictSummary(
    transportOrderPower: number,
    challenges: Record<number, number[]>,
    maxPower: number
  ): string {
    let powerSummary = `${transportOrderPower}`;

    let currentPower = maxPower;
    while (currentPower > 0) {
      challenges[currentPower].forEach(() => {
        powerSummary += `v${currentPower}`;
      });
      currentPower--;
    }

    return powerSummary;
  }

  resolveTransportChallenge(
    transportOrderPower: number,
    challenger: UnitOrderResolution,
    challenges: Record<number, number[]>,
    maxPower: number
  ) {
    const victory = challenger.power === maxPower && challenges[maxPower].length === 1;
    let summary = victory ? `Victory: ` : `Bounce: `;
    challenger.orderSuccess = victory;

    let currentPower = maxPower;
    while (currentPower > 0) {
      challenges[currentPower].forEach((challengerId: number) => {
        if (challenger.unit.id !== challengerId) {
          summary += `v${currentPower}`;
        }
      });
      if (transportOrderPower === currentPower) {
        summary += `v${transportOrderPower}`;
      }
      currentPower--;
    }

    challenger.primaryResolution = summary;
  }

  resolveMovement(
    order: UnitOrderResolution,
    unitOrders: UnitOrderResolution[],
    dependencies: OrderDependencies,
    supremacies: Record<string, OrderSupremacy>,
    transportAttempts: Record<string, TransportAttempt>
  ) {
    const nuclearStrike = unitOrders.find(
      (strike: UnitOrderResolution) =>
        strike.orderType === OrderDisplay.NUKE && strike.destination.provinceId === order.destination.provinceId
    );
    if (nuclearStrike) {
      order.valid = false;
      order.orderSuccess = false;
      order.primaryResolution = `Invalid Order: Can't Enter Nuclear Fallout`;
      return;
    }

    if (order.orderType === OrderDisplay.MOVE_CONVOYED) {
      if (
        !transportAttempts[`${order.unit.id}-${order.destination.nodeId}`] ||
        transportAttempts[`${order.unit.id}-${order.destination.nodeId}`].paths.length === 0
      ) {
        order.valid = false;
        order.primaryResolution = `Invalid Order: Insufficient Transports`;
        return;
      }
    }

    const challengers = unitOrders.filter((challenger: UnitOrderResolution) => {
      const challengerMoving = [OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(challenger.orderType);
      const notSameUnit = challenger.unit.id !== order.unit.id;
      const challengerValid = challenger.valid === true;
      const challengingAtDestination = challenger.destination.provinceId === order.destination.provinceId;
      const challengingFromDestination =
        challenger.destination.provinceId === order.origin.provinceId &&
        challenger.origin.provinceId === order.destination.provinceId;

      return (
        (challengingAtDestination || challengingFromDestination) && challengerMoving && notSameUnit && challengerValid
      );
    });

    const holdingChallenger = unitOrders.find(
      (challenger: UnitOrderResolution) =>
        challenger.origin.provinceId === order.destination.provinceId &&
        [
          OrderDisplay.HOLD,
          OrderDisplay.SUPPORT,
          OrderDisplay.SUPPORT_CONVOYED,
          OrderDisplay.AIRLIFT,
          OrderDisplay.CONVOY
        ].includes(challenger.orderType) &&
        // challenger.orderSuccess === null &&
        challenger.valid === true
    );

    if (holdingChallenger) {
      if (holdingChallenger.unit.countryId === order.unit.countryId) {
        order.valid = false;
        order.primaryResolution = `Invalid Order: Can't Self-Dislodge`;
        return;
      }
      challengers.push(holdingChallenger);
    }

    if (challengers.length > 0) {
      this.resolveMovementChallenge(order, challengers);
    } else {
      order.orderSuccess = true;
      order.primaryResolution = 'Success';
    }

    if (order.orderSuccess) {
      const leavingUnit = unitOrders.find(
        (leavingUnit: UnitOrderResolution) => leavingUnit.origin.provinceId === order.destination.provinceId
      );

      // TO DO
      if (leavingUnit && order.power === (leavingUnit.unit.type === UnitType.NUKE ? 0 : 1)) {
        this.setDependency(
          dependencies,
          leavingUnit.orderId,
          order.orderId,
          `Failed: Bounce ${order.power}v${leavingUnit.unit.type === UnitType.NUKE ? 0 : 1}`
        );
      } else if (leavingUnit && leavingUnit.unit.countryId === order.unit.countryId) {
        this.setDependency(dependencies, leavingUnit.orderId, order.orderId, `Invalid Order: Can't Self-Dislodge`);
      } else if (leavingUnit && leavingUnit.unit.countryId !== order.unit.countryId) {
        supremacies[order.orderId] = {
          supremeOrder: order,
          secondaryOrderId: leavingUnit,
          description: `Success: ${order.power}v1`
        };
      }
    } else {
      this.resolveHold(order, unitOrders, true, 1);
    }
  }

  resolveRetreatingMovement(order: UnitOrderResolution, unitOrders: UnitOrderResolution[]) {
    const challengers = unitOrders.filter((challenger: UnitOrderResolution) => {
      const challengerMoving = challenger.orderType === OrderDisplay.MOVE;
      const notSameUnit = challenger.unit.id !== order.unit.id;
      const challengerValid = challenger.valid === true;
      const challengingAtDestination = challenger.destination.provinceId === order.destination.provinceId;

      return challengingAtDestination && challengerMoving && notSameUnit && challengerValid;
    });

    if (challengers.length > 0) {
      // Retreating units can't do battle
      order.orderSuccess = false;
      order.primaryResolution = 'Disbanded: Conflicting Retreats';
      order.unit.status = UnitStatus.DISBANDED_RETREAT;
    } else {
      order.orderSuccess = true;
      order.primaryResolution = 'Success';
      order.unit.status = UnitStatus.ACTIVE;
    }
  }

  resolveMovementChallenge(movementOrder: UnitOrderResolution, challengers: UnitOrderResolution[]) {
    const challenges: Record<number, number[]> = {};
    let maxPower = movementOrder.power;

    challengers.forEach((challenger: UnitOrderResolution) => {
      if (challenges[challenger.power]) {
        challenges[challenger.power].push(challenger.power);
      } else {
        challenges[challenger.power] = [challenger.power];
      }
      maxPower = challenger.power > maxPower ? challenger.power : maxPower;
    });

    const victory = movementOrder.power === maxPower && !challenges[maxPower];
    if (challenges[maxPower] && movementOrder.power === challenges[maxPower][0]) {
      movementOrder.destination.contested = true;
    }
    let summary = victory ? `Victory: ${movementOrder.power}` : `Bounce: ${movementOrder.power}`;
    movementOrder.orderSuccess = victory;

    let currentPower = maxPower;
    while (currentPower > 0) {
      if (challenges[currentPower]) {
        challenges[currentPower].forEach(() => {
          summary += `v${currentPower}`;
        });
      }
      currentPower--;
    }

    movementOrder.primaryResolution = summary;
  }

  checkDependencies(dependencies: OrderDependencies, unitOrders: UnitOrderResolution[]) {
    dependencies.heads.forEach((orderId: number) => {
      this.checkDependency(orderId, dependencies, unitOrders);
    });
  }

  checkSupremacies(supremacies: Record<string, OrderSupremacy>) {
    for (const supremacy in supremacies) {
      const supremacyOrder = supremacies[supremacy];
      if (!supremacyOrder.secondaryOrderId.orderSuccess) {
        supremacyOrder.supremeOrder.primaryResolution = supremacyOrder.description;
      }
    }
  }

  /**
   * Checks holds and supports when attacked. Supporting check follows after support description.
   * @param holdOrder
   * @param unitOrders
   * @param supporting
   */
  resolveHold(holdOrder: UnitOrderResolution, unitOrders: UnitOrderResolution[], secondary?: boolean, power?: number) {
    holdOrder.orderSuccess = secondary ? false : true;
    holdOrder.power = power ? power : holdOrder.power;
    // holdOrder.primaryResolution = 'Success';;

    const challenges: Record<number, number[]> = {};
    let maxPower = holdOrder.power;

    const challengers = unitOrders.filter(
      (challenger: UnitOrderResolution) =>
        challenger.destination.provinceId === holdOrder.origin.provinceId &&
        [OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(challenger.orderType)
    );

    if (challengers.length > 0) {
      let winningChallenger: UnitOrderResolution = challengers[0];

      challengers.forEach((challenger: UnitOrderResolution) => {
        if (challenges[challenger.power]) {
          challenges[challenger.power].push(challenger.power);
        } else {
          challenges[challenger.power] = [challenger.power];
        }

        if (challenger.power > maxPower) {
          maxPower = challenger.power;
          winningChallenger = challenger;
        }
      });

      const victory = holdOrder.power === maxPower;

      let summary = `${victory ? 'Victory' : 'Dislodged'}: ${holdOrder.power}`;
      holdOrder.orderSuccess = victory;
      holdOrder.unit.status = victory ? UnitStatus.ACTIVE : UnitStatus.RETREAT;
      holdOrder.displacerProvinceId = victory ? undefined : winningChallenger.origin.provinceId;

      let currentPower = maxPower;
      while (currentPower > 0) {
        if (challenges[currentPower]) {
          challenges[currentPower].forEach(() => {
            summary += `v${currentPower}`;
          });
        }
        currentPower--;
      }

      if (secondary) {
        holdOrder.secondaryResolution = summary;
      } else {
        holdOrder.primaryResolution = summary;
      }
    }
  }

  checkDependency(orderId: number, dependencies: OrderDependencies, unitOrders: UnitOrderResolution[]) {
    const independency = unitOrders.find((order: UnitOrderResolution) => order.orderId === orderId);
    if (independency) {
      const dependency = unitOrders.find(
        (order: UnitOrderResolution) => order.orderId === dependencies.dependency[orderId].orderId
      );
      if (dependency) {
        if (!independency.orderSuccess) {
          dependency.orderSuccess = false;
          dependency.primaryResolution = dependencies.dependency[orderId].description;
        }

        if (dependencies.dependency[dependency.orderId]) {
          this.checkDependency(dependency.orderId, dependencies, unitOrders);
        }
      }
    }
  }

  async resolveTransfers(gameState: GameState, turn: UpcomingTurn): Promise<TransferResources> {
    const transferResources: TransferResources = {
      countryResources: await db.resolutionRepo.getTransferResourceValidation(gameState.gameId, gameState.turnNumber),
      handshakes: {
        offers: {},
        requests: {}
      }
    };
    transferResources.techTransferResults = await this.validateTechTransfers(
      gameState.gameId,
      gameState.turnNumber,
      turn.turnId,
      transferResources
    );
    transferResources.buildTransferResults = await this.validateBuildTransfers(turn.turnId, transferResources);
    return transferResources;
  }

  async validateTechTransfers(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    transferResources: TransferResources
  ): Promise<TransferTechOrder[]> {
    const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartners(
      gameId,
      turnNumber,
      orderTurnId,
      0
    );

    techTransferOrders.forEach((order: TransferTechOrder) => {
      const partnerCountry = techTransferOrders.find(
        (resource: TransferTechOrder) => resource.countryId === order.foreignCountryId
      );

      if (partnerCountry) {
        const playerCountry = techTransferOrders.find(
          (resource: TransferTechOrder) => resource.countryId === order.countryId
        );

        if (playerCountry) {
          if (playerCountry.hasNukes && !partnerCountry.hasNukes) {
            transferResources.handshakes.offers[playerCountry.countryId] = partnerCountry.countryId;
            if (transferResources.handshakes.requests[partnerCountry.countryId] === playerCountry.countryId) {
              playerCountry.success = true;
              partnerCountry.success = true;
            }
          } else if (!playerCountry.hasNukes && partnerCountry.hasNukes) {
            transferResources.handshakes.requests[playerCountry.countryId] = partnerCountry.countryId;
            if (transferResources.handshakes.offers[partnerCountry.countryId] === playerCountry.countryId) {
              playerCountry.success = true;
              partnerCountry.success = true;
            }
          }
        }
      } else {
        order.success = false;
      }
    });

    return techTransferOrders;
  }

  async validateBuildTransfers(turnId: number, transferResources: TransferResources): Promise<TransferBuildOrder[]> {
    const buildTransferOrders: TransferBuildOrder[] = await db.ordersRepo.getBuildTransferOrders(0, turnId);

    buildTransferOrders.forEach((transferOrder: TransferBuildOrder) => {
      const playerCountry = transferResources.countryResources.find(
        (country: CountryTransferResources) => country.countryId === transferOrder.countryId
      );

      if (playerCountry) {
        if (playerCountry.buildsRemaining >= transferOrder.quantity) {
          playerCountry.buildsRemaining -= transferOrder.quantity;
        } else {
          transferOrder.quantity = playerCountry?.buildsRemaining;
          playerCountry.buildsRemaining -= transferOrder.quantity;
        }
      }
    });
    return buildTransferOrders;
  }

  getFinalPosition(result: UnitOrderResolution): OrderResolutionLocation {
    let finalPosition: OrderResolutionLocation = result.origin;
    if (
      (result.unit.status === UnitStatus.ACTIVE || result.unit.status === UnitStatus.FALLOUT) &&
      (result.orderType === OrderDisplay.MOVE ||
        result.orderType === OrderDisplay.MOVE_CONVOYED ||
        result.orderType === OrderDisplay.NUKE) &&
      result.orderSuccess
    ) {
      finalPosition = result.destination;
    }
    return finalPosition;
  }

  createProvinceHistory(
    result: UnitOrderResolution,
    finalPosition: OrderResolutionLocation,
    turn: UpcomingTurn
  ): ProvinceHistoryRow {
    return {
      provinceId: finalPosition.provinceId,
      controllerId: this.resolveControllerId(result, finalPosition, turn),
      capitalOwnerId: finalPosition.capitalOwnerId,
      provinceStatus: this.resolveProvinceStatus(result, finalPosition, turn),
      validRetreat: false
    };
  }

  resolveControllerId(result: UnitOrderResolution, finalPosition: OrderResolutionLocation, turn: UpcomingTurn): number {
    if (
      ([ProvinceType.COAST, ProvinceType.INLAND, ProvinceType.ISLAND].includes(finalPosition.provinceType) &&
        turn.hasCaptures &&
        result.unit.canCapture) ||
      ([ProvinceType.COAST, ProvinceType.INLAND, ProvinceType.ISLAND].includes(finalPosition.provinceType) &&
        finalPosition.provinceStatus === ProvinceStatus.INERT)
    ) {
      return result.unit.countryId;
    } else {
      return finalPosition.controllerId;
    }
  }

  resolveProvinceStatus(
    result: UnitOrderResolution,
    finalPosition: OrderResolutionLocation,
    turn: UpcomingTurn
  ): ProvinceStatus {
    if (result.orderType === OrderDisplay.NUKE && [CityType.CAPITAL, CityType.VOTE].includes(finalPosition.cityType)) {
      return ProvinceStatus.NUKED;
    } else if (result.orderType === OrderDisplay.NUKE) {
      return ProvinceStatus.INERT;
    }

    if (
      [ProvinceType.COAST, ProvinceType.INLAND, ProvinceType.ISLAND].includes(finalPosition.provinceType) && [
        ProvinceStatus.ACTIVE,
        ProvinceStatus.DORMANT,
        ProvinceStatus.BOMBARDED
      ] &&
      turn.hasCaptures &&
      result.unit.canCapture
    ) {
      return ProvinceStatus.ACTIVE;
    }

    if (
      [ProvinceType.COAST, ProvinceType.INLAND, ProvinceType.ISLAND].includes(finalPosition.provinceType) && [
        ProvinceStatus.ACTIVE,
        ProvinceStatus.DORMANT,
        ProvinceStatus.BOMBARDED
      ] &&
      turn.hasCaptures &&
      result.unit.type === UnitType.WING
    ) {
      return ProvinceStatus.BOMBARDED;
    }

    return ProvinceStatus.INERT;
  }

  // setNewHistory(
  //   dbStates: DbStates,
  //   dbUpdates: DbUpdates,
  //   table: 'units' | 'provinces' | 'countries',
  //   coreId: number
  // ): {
  //   details: ProvinceHistoryRow | UnitHistoryRow | CountryHistoryRow | undefined;
  //   isNewRow: boolean;
  // } {
  //   if (table === 'units') {
  //     const rowData = {
  //       details: dbUpdates.unitHistories.find((preparedRow: UnitHistoryRow) => preparedRow.unitId === coreId),
  //       isNewRow: false
  //     };

  //     if (!rowData.details) {
  //       const priorRow = dbStates.unitHistories.find((existingRow: UnitHistoryRow) => existingRow.unitId === coreId);
  //       if (!priorRow) {
  //         terminalLog(`No pre-existing unit history for unit ${coreId}`);
  //         return { details: undefined, isNewRow: false };
  //       }

  //       rowData.details = this.copyUnitHistory(priorRow);
  //       rowData.isNewRow = true;
  //     }

  //     return rowData;
  //   }

  //   if (table === 'provinces') {
  //     const rowData = {
  //       details: dbUpdates.provinceHistories.find(
  //         (preparedRow: ProvinceHistoryRow) => preparedRow.provinceId === coreId
  //       ),
  //       isNewRow: false
  //     };

  //     if (!rowData.details) {
  //       const priorRow = dbStates.provinceHistories.find(
  //         (existingRow: ProvinceHistoryRow) => existingRow.provinceId === coreId
  //       );
  //       if (!priorRow) {
  //         terminalLog(`No pre-existing unit history for province ${coreId}`);
  //         return { details: undefined, isNewRow: false };
  //       }

  //       rowData.details = this.copyProvinceHistory(priorRow);
  //       rowData.isNewRow = true;
  //     }

  //     return rowData;
  //   }

  //   const rowData = {
  //     details: dbUpdates.countryHistories[coreId],
  //     isNewRow: false
  //   };

  //   if (!rowData.details) {
  //     const priorRow = dbStates.countryHistories.find(
  //       (existingRow: CountryHistoryRow) => existingRow.countryId === coreId
  //     );
  //     if (!priorRow) {
  //       terminalLog(`No pre-existing unit history for country ${coreId}`);
  //       return { details: undefined, isNewRow: false };
  //     }

  //     rowData.details = this.copyCountryHistory(priorRow);
  //     rowData.isNewRow = true;
  //   }

  //   return rowData;
  // }

  getOrCreateProvinceHistory(
    provinceHistories: ProvinceHistoryRow[],
    finalPosition: OrderResolutionLocation
  ): ProvinceHistoryRow {
    let provinceHistory = provinceHistories.find(
      (province: ProvinceHistoryRow) => province.provinceId === finalPosition.provinceId
    );
    if (provinceHistory === undefined) {
      provinceHistory = {
        provinceId: finalPosition.provinceId,
        controllerId: finalPosition.capitalOwnerId,
        capitalOwnerId: finalPosition.capitalOwnerId,
        provinceStatus: finalPosition.provinceStatus,
        validRetreat: true
      };
    }
    return provinceHistory;
  }

  /**
   * Prepares DB rows for the firing nuke and impacted countries and province.
   * The target of the nuke resolves its destruction elsewhere.
   */
  handleNuclearStrike(result: UnitOrderResolution, dbStates: DbStates, dbUpdates: DbUpdates) {
    const finalPosition: OrderResolutionLocation = this.getFinalPosition(result);
    const currentUnitHistory: UnitHistoryRow | undefined = dbStates.unitHistories?.find(
      (unitState: UnitHistoryRow) => unitState.unitId === result.unit.id
    );

    if (!currentUnitHistory) {
      terminalLog(
        `No pre-existing unit history for ordered unit ${result.unit.countryName} ${result.unit.type} (${result.unit.id})`
      );
      return;
    }

    if (currentUnitHistory.nodeId !== finalPosition.nodeId || currentUnitHistory.unitStatus !== result.unit.status) {
        dbUpdates.unitHistories[result.unit.id] = {
          unitId: result.unit.id,
          nodeId: result.destination.nodeId,
          unitStatus: result.unit.status
        };
    }

    // Province
    const newProvinceHistory: ProvinceHistoryRow = this.rowifyResultLocation(finalPosition);
    newProvinceHistory.provinceStatus = ProvinceStatus.NUKED;
    newProvinceHistory.validRetreat = false;
    dbUpdates.provinceHistories[newProvinceHistory.provinceId] = newProvinceHistory;
  }

  handleNuclearVictim(result: UnitOrderResolution, dbStates: DbStates, dbUpdates: DbUpdates) {
    dbUpdates.unitHistories[result.unit.id] = {
      unitId: result.unit.id,
      nodeId: result.origin.nodeId,
      unitStatus: UnitStatus.NUKED
    };
  }

  handleSpringMovement(result: UnitOrderResolution, dbStates: DbStates, dbUpdates: DbUpdates) {
    const unitHistory = dbStates.unitHistories?.find(
      (unitHistory: UnitHistoryRow) => unitHistory.unitId === result.unit.id
    );

    if (!unitHistory) {
      terminalLog(
        `No pre-existing unit history for ${result.unit.countryName} ${result.unit.type} (${result.unit.id})`
      );
      return;
    }

    const finalPosition: OrderResolutionLocation = this.getFinalPosition(result);
    if (unitHistory.nodeId !== finalPosition.nodeId || unitHistory.unitStatus !== result.unit.status) {
      const newUnitHistory = this.copyUnitHistory(unitHistory);
      newUnitHistory.unitStatus = result.unit.status;
      newUnitHistory.nodeId = finalPosition.nodeId;
      newUnitHistory.displacerProvinceId = result.unit.status === UnitStatus.RETREAT
        ? result.displacerProvinceId
        : undefined;

      dbUpdates.unitHistories[newUnitHistory.unitId] = newUnitHistory;
    }

    // Setting Province Contested
    if (
      [OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(result.orderType) &&
      result.orderSuccess === false &&
      result.destination.contested
    ) {
      const bounceFound = Object.values(dbUpdates.provinceHistories).find(
        (province: ProvinceHistoryRow) => province.provinceId === result.destination.provinceId
      );
      if (!bounceFound) {
        const newBounceProvinceHistory = this.rowifyResultLocation(result.destination);
        newBounceProvinceHistory.validRetreat = false;
        dbUpdates.provinceHistories[newBounceProvinceHistory.provinceId] = newBounceProvinceHistory;
      }
    }
  }

  handleMovementResults(
    result: UnitOrderResolution,
    dbStates: DbStates,
    dbUpdates: DbUpdates,
    isRetreatTurn: boolean,
    isFallTurn: boolean
  ) {
      const unitHistory = dbStates.unitHistories?.find(
        (unitHistory: UnitHistoryRow) => unitHistory.unitId === result.unit.id
      );

      if (!unitHistory) {
        terminalLog(
          `No pre-existing unit history for ${result.unit.countryName} ${result.unit.type} (${result.unit.id})`
        );
        return;
      }

    const finalPosition: OrderResolutionLocation = this.getFinalPosition(result);
      if (unitHistory.nodeId !== finalPosition.nodeId || unitHistory.unitStatus !== result.unit.status) {
        const newUnitHistory = this.copyUnitHistory(unitHistory);
        newUnitHistory.unitStatus = result.unit.status;
        newUnitHistory.nodeId = finalPosition.nodeId;
        if (result.unit.status === UnitStatus.RETREAT) {
          newUnitHistory.displacerProvinceId = result.displacerProvinceId;
        }

        dbUpdates.unitHistories[newUnitHistory.unitId] = newUnitHistory;
    }

    if (isFallTurn) {
      const provinceDetails = dbUpdates.provinceHistories[finalPosition.provinceId]
      ? dbUpdates.provinceHistories[finalPosition.provinceId]
      : dbStates.provinceHistories.find((province: ProvinceHistoryRow) => province.provinceId === finalPosition.provinceId);

      if (!provinceDetails) {
        terminalLog(`No pre-existing province history for ${finalPosition.provinceName} (${finalPosition.provinceId})`);
        return;
      }

      if (finalPosition.controllerId !== result.unit.countryId && result.unit.canCapture) {
        provinceDetails.controllerId = result.unit.countryId;
      }

      if (
        finalPosition.controllerId !== result.unit.countryId &&
        finalPosition.provinceStatus === ProvinceStatus.ACTIVE &&
        result.unit.type === UnitType.WING
      ) {
        provinceDetails.provinceStatus = ProvinceStatus.BOMBARDED;
      }

      if (
        ![ProvinceStatus.INERT, ProvinceStatus.NUKED].includes(finalPosition.provinceStatus) &&
        result.unit.canCapture
      ) {
        provinceDetails.provinceStatus = ProvinceStatus.ACTIVE;
      }

      dbUpdates.provinceHistories[provinceDetails.provinceId] = provinceDetails;
    }

    // Setting Province Contested
    if (
      [OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(result.orderType) &&
      result.orderSuccess === false &&
      result.destination.contested
    ) {
      const bounceFound = Object.values(dbUpdates.provinceHistories).find(
        (province: ProvinceHistoryRow) => province.provinceId === result.destination.provinceId
      );
      if (!bounceFound) {
        const newBounceProvinceHistory = this.rowifyResultLocation(result.destination);
        newBounceProvinceHistory.validRetreat = false;
        dbUpdates.provinceHistories[newBounceProvinceHistory.provinceId] = newBounceProvinceHistory;
      }
    }
  }

  handleDisband(result: UnitOrderResolution, dbStates: DbStates, dbUpdates: DbUpdates) {
    const unitHistory = dbStates.unitHistories?.find(
      (unitHistory: UnitHistoryRow) => unitHistory.unitId === result.unit.id
    );

    if (!unitHistory) {
      terminalLog(
        `No pre-existing unit history for ${result.unit.countryName} ${result.unit.type} (${result.unit.id})`
      );
      return;
    }

    const newUnitHistory = this.copyUnitHistory(unitHistory);
    newUnitHistory.unitStatus = UnitStatus.DISBANDED_RETREAT;
    dbUpdates.unitHistories[newUnitHistory.unitId] = newUnitHistory;
  }

  prepareBombardRows(result: UnitOrderResolution, dbStates: DbStates, dbUpdates: DbStates, claimingSeason: boolean) {
      const unitHistory = dbStates.unitHistories?.find(
        (unitHistory: UnitHistoryRow) => unitHistory.unitId === result.unit.id
      );

      if (!unitHistory) {
        terminalLog(
          `No pre-existing unit history for ${result.unit.countryName} ${result.unit.type} (${result.unit.id})`
        );
        return;
      }

    const finalPosition: OrderResolutionLocation = this.getFinalPosition(result);
      if (unitHistory.nodeId !== finalPosition.nodeId || unitHistory.unitStatus !== result.unit.status) {
        const newUnitHistory = this.copyUnitHistory(unitHistory);
        newUnitHistory.nodeId = finalPosition.nodeId;
        newUnitHistory.unitStatus = result.unit.status;
        dbUpdates.unitHistories?.push(newUnitHistory);
    }

      const provinceHistory = dbStates.provinceHistories?.find(
        (province: ProvinceHistoryRow) => province.provinceId === finalPosition.provinceId
      );

      if (!provinceHistory) {
        terminalLog(`No pre-existing province history for ${finalPosition.provinceName} (${finalPosition.provinceId})`);
        return;
      }

      if ([ProvinceType.COAST, ProvinceType.INLAND, ProvinceType.ISLAND].includes(finalPosition.provinceType)) {
        let provinceStateChanged = false;
        const newProvinceHistory = this.rowifyResultLocation(finalPosition);

        // Control
        if (
          [ProvinceStatus.INERT, ProvinceStatus.NUKED].includes(finalPosition.provinceStatus) &&
          finalPosition.controllerId !== result.unit.countryId
        ) {
          newProvinceHistory.controllerId = result.unit.countryId;
          provinceStateChanged = true;
        }

        // Status
        if (
          finalPosition.provinceStatus === ProvinceStatus.ACTIVE &&
          finalPosition.controllerId !== result.unit.countryId &&
          claimingSeason
        ) {
          newProvinceHistory.provinceStatus = ProvinceStatus.BOMBARDED;
          provinceStateChanged = true;
        }

        if (provinceStateChanged) {
          dbUpdates.provinceHistories?.push(newProvinceHistory);
      }
    }

    // Setting Province Contested
    if (result.orderType === OrderDisplay.MOVE && result.orderSuccess === false && result.destination.contested) {
      const bounceFound = dbUpdates.provinceHistories?.find(
        (province: ProvinceHistoryRow) => province.provinceId === result.destination.provinceId
      );
      if (!bounceFound) {
        const newBounceProvinceHistory = this.rowifyResultLocation(result.destination);
        newBounceProvinceHistory.validRetreat = false;
        dbUpdates.provinceHistories?.push(newBounceProvinceHistory);
      }
    }
  }

  async getAbandonedBombards(gameState: GameState): Promise<ProvinceHistoryRow[]> {
    return await db.resolutionRepo.getAbandonedBombards(gameState.gameId, gameState.turnNumber);
  }

  async restoreBombardedProvinces(abandonedBombards: ProvinceHistoryRow[], turnId: number): Promise<void> {
    return await db.resolutionRepo.restoreBombardedProvinces(abandonedBombards, turnId);
  }

  /**
   * Converts the data from an OrderResolution Destination or Origin into a province history row entry.
   *
   * @param location
   * @returns
   */
  rowifyResultLocation(location: OrderResolutionLocation): ProvinceHistoryRow {
    return {
      provinceId: location.provinceId,
      controllerId: location.controllerId,
      capitalOwnerId: location.capitalOwnerId,
      provinceStatus: location.provinceStatus,
      validRetreat: location.validRetreat
    };
  }

  /**
   * Duplicates a unit history row for manipulation without undesired referencing behavior.
   * @param unitHistory
   * @returns
   */
  copyUnitHistory(unitHistory: UnitHistoryRow): UnitHistoryRow {
    return {
      unitId: unitHistory.unitId,
      countryId: unitHistory.countryId,
      nodeId: unitHistory.nodeId,
      unitStatus: unitHistory.unitStatus
    };
  }

  copyProvinceHistory(provinceHistory: ProvinceHistoryRow): ProvinceHistoryRow {
    return {
      provinceId: provinceHistory.provinceId,
      controllerId: provinceHistory.controllerId,
      capitalOwnerId: provinceHistory.capitalOwnerId,
      provinceStatus: provinceHistory.provinceStatus,
      validRetreat: provinceHistory.validRetreat
    };
  }

  /**
   * Duplicates a country history row for manipulation without undesired referencing behavior.
   * @param countryHistory
   * @returns
   */
  copyCountryHistory(countryHistory: CountryHistoryRow): CountryHistoryRow {
    return {
      turnId: countryHistory.turnId,
      countryId: countryHistory.countryId,
      countryStatus: countryHistory.countryStatus,
      cityCount: countryHistory.cityCount,
      unitCount: countryHistory.unitCount,
      bankedBuilds: countryHistory.bankedBuilds,
      nukeRange: countryHistory.nukeRange,
      adjustments: countryHistory.adjustments,
      inRetreat: countryHistory.inRetreat,
      voteCount: countryHistory.voteCount,
      nukesInProduction: countryHistory.nukesInProduction
    };
  }

  revertContestedProvinces(
    currentProvinceHistories: ProvinceHistoryRow[],
    pendingProvinceHistories: Record<number, ProvinceHistoryRow>
  ): void {
    const deletionKeys: number[] = [];

    // Existing invalid retreats could never be impacting by retreats
    const currentInvalidRetreats = currentProvinceHistories.filter(
      (currentProvinceHistory: ProvinceHistoryRow) => !currentProvinceHistory.validRetreat
    );

    if (currentInvalidRetreats.length > 0) {
      currentInvalidRetreats.forEach((currentProvinceHistory: ProvinceHistoryRow) => {
        const updatedProvinceHistory = this.copyProvinceHistory(currentProvinceHistory);
        updatedProvinceHistory.validRetreat = true;

        pendingProvinceHistories[currentProvinceHistory.provinceId] = (updatedProvinceHistory);
      });
    } else {
      Object.values(pendingProvinceHistories).forEach((pendingProvinceHistory: ProvinceHistoryRow) => {
        const currentProvinceHistory = currentProvinceHistories.find(
          (currentProvinceHistory: ProvinceHistoryRow) =>
            pendingProvinceHistory.provinceId === currentProvinceHistory.provinceId
        );

        if (!currentProvinceHistory) {
          terminalAddendum(
            'Resolution',
            `Current Province History for ${pendingProvinceHistory.provinceId} not found!`
          );
          return;
        }

        if (
          pendingProvinceHistory.controllerId === currentProvinceHistory.controllerId &&
          pendingProvinceHistory.capitalOwnerId === currentProvinceHistory.capitalOwnerId &&
          pendingProvinceHistory.provinceStatus === currentProvinceHistory.provinceStatus
        ) {
          deletionKeys.unshift(pendingProvinceHistory.provinceId);
        }
        pendingProvinceHistory.validRetreat = true;
      });

      deletionKeys.forEach((key: number) => {
        delete pendingProvinceHistories[key];
      });
    }
  }

  dissipateNukes(
    currentUnitHistories: UnitHistoryRow[],
    pendingUnitHistories: Record<number, UnitHistoryRow>
  ): void {
    // Nukes in state of fallout
    const nukesInFallout = currentUnitHistories.filter(
      (currentUnitHistory: UnitHistoryRow) => currentUnitHistory.unitStatus === UnitStatus.FALLOUT
    );

    if (nukesInFallout.length > 0) {
      nukesInFallout.forEach((currentUnitHistory: UnitHistoryRow) => {
        const updatedUnitHistory = this.copyUnitHistory(currentUnitHistory);
        updatedUnitHistory.unitStatus = UnitStatus.DETONATED;

        pendingUnitHistories[updatedUnitHistory.unitId] = updatedUnitHistory;
      });
    }
  }

  async validateNominations(turn: UpcomingTurn, gameState: GameState): Promise<NominationRow[]> {
    const nominatedCountries = await db.ordersRepo.getNominationOrder(turn.gameId, turn.turnNumber, turn.turnId, 0);
    const nominationLibrary: Record<string, NominationRow> = {};
    const validNominations: NominationRow[] = [];

    nominatedCountries.forEach((nominatedCountry: NominatableCountry) => {
      const nomination = nominationLibrary[nominatedCountry.nominatorId];
      if (!nomination) {
        nominationLibrary[nominatedCountry.nominatorId] = {
          nominatorId: nominatedCountry.nominatorId,
          turnId: turn.turnId,
          countryIds: nominatedCountry.countryId ? [nominatedCountry.countryId] : [],
          signature: nominatedCountry.rank,
          votesRequired: gameState.votingSchedule.baseFinal + gameState.votingSchedule.penalties[nominatedCountry.rank],
          valid: false
        };
      } else if (nomination?.countryIds.length > 0) {
        nomination.countryIds.push(nominatedCountry.countryId);
        nomination.signature += nominatedCountry.rank;
        nomination.votesRequired += gameState.votingSchedule.penalties[nominatedCountry.rank];
        nomination.valid = nomination.countryIds.length === 3;
      }
    });

    for (const nomination in nominationLibrary) {
      if (nominationLibrary[nomination].valid) {
        validNominations.push(nominationLibrary[nomination]);
      }
    }
    return validNominations;
  }

  // async eliminateCountry(
  //   eliminatedCountryChanges: CountryStatChanges,
  //   dbStates: DbStates,
  //   dbUpdates: DbUpdates
  // ) {
  //   if (!eliminatedCountryChanges.capitalControllerId) {
  //     terminalAddendum('Resolution Elimination', `No capital controller for ${eliminatedCountryChanges.countryId}`);
  //     return;
  //   }

  //   eliminatedCountryChanges.countryStatus = CountryStatus.ELIMINATED;
  //   let occupyingCountryHistory: CountryHistoryRow | undefined =
  //     dbUpdates.countryHistories[countryStats.occupyingCountryId];
  //   if (!occupyingCountryHistory) {
  //     const occupyingCountryHistoryRow = dbStates.countryHistories.find(
  //       (country: CountryHistoryRow) => country.countryId === countryStats.occupyingCountryId
  //     );

  //     if (occupyingCountryHistoryRow) {
  //       occupyingCountryHistory = this.copyCountryHistory(occupyingCountryHistoryRow);
  //     }
  //   }

  //   occupyingCountryHistory.voteCount++;
  //   occupyingCountryHistory.newCapitals = occupyingCountryHistory.newCapitals
  //     ? occupyingCountryHistory.newCapitals + 1
  //     : 1;
  //   dbUpdates.countryHistories[countryStats.countryId] = countryHistory;
  //   dbUpdates.countryHistories[countryStats.occupyingCountryId] = occupyingCountryHistory;
  //   this.transferRemainingProvinces(
  //     eliminatedCountryChanges.countryId,
  //     eliminatedCountryChanges.capitalControllerId,
  //     dbStates,
  //     dbUpdates,
  //     turn.turnId
  //   );
  // }

  async transferRemainingProvinces(
    eliminatedCountryId: number,
    conqueringCountryId: number,
    dbStates: DbStates,
    dbUpdates: DbUpdates
  ) {
    const updatedProvinceHistories: Set<number> = new Set();
    Object.values(dbUpdates.provinceHistories).forEach((province: ProvinceHistoryRow) => {
      if (province.controllerId === eliminatedCountryId) {
        province.controllerId = conqueringCountryId;
      }
      updatedProvinceHistories.add(province.provinceId);
    });

    Object.values(dbStates.provinceHistories).forEach((province: ProvinceHistoryRow) => {
      if (province.controllerId === eliminatedCountryId && !updatedProvinceHistories.has(province.provinceId)) {
        const newProvinceHistory = this.copyProvinceHistory(province);
        newProvinceHistory.controllerId = conqueringCountryId;
        dbUpdates.provinceHistories[province.provinceId] = newProvinceHistory;
      }
    });
  }

  prepareCountryHistories(dbStates: DbStates, dbUpdates: DbUpdates): void {
    const survivingCountryIds: Set<number> = new Set();
    dbStates.countryHistories.forEach((country: CountryHistoryRow) => {
        if (country.countryStatus !== CountryStatus.ELIMINATED) {
          survivingCountryIds.add(country.countryId);
        }
      }
    );
    const unitsUpdated: Set<number> = new Set();
    const provincesUpdated: Set<number> = new Set();

    // Checks units that have updates prepared and credits countries if alive
    Object.values(dbUpdates.unitHistories).forEach((unitHistory: UnitHistoryRow) => {
      if ([UnitStatus.ACTIVE, UnitStatus.RETREAT].includes(unitHistory.unitStatus)) {
        this.creditCountryWithUnit(unitHistory, dbUpdates);

        unitsUpdated.add(unitHistory.unitId);
      }
    });

    // Checks units that have no updates prepared and credits countries
    Object.values(dbStates.unitHistories).forEach((unitHistory: UnitHistoryRow) => {
      if ([UnitStatus.ACTIVE, UnitStatus.RETREAT].includes(unitHistory.unitStatus) && !unitsUpdated.has(unitHistory.unitId)) {
        this.creditCountryWithUnit(unitHistory, dbUpdates);
      }

      unitsUpdated.add(unitHistory.unitId);
    });

    // Checks provinces that have been updated and credits countries with cities, votes and checks capital state
    Object.values(dbUpdates.provinceHistories).forEach((provinceHistory: ProvinceHistoryRow) => {
      this.creditCountryWithProvince(provinceHistory, dbUpdates, survivingCountryIds);

      provincesUpdated.add(provinceHistory.provinceId);
    });

    // Checks provinces that haven't been updated and credits countries with cities, votes and checks capital state
    Object.values(dbStates.provinceHistories).forEach((provinceHistory: ProvinceHistoryRow) => {
      this.creditCountryWithProvince(provinceHistory, dbUpdates, survivingCountryIds);

      provincesUpdated.add(provinceHistory.provinceId);
    });

    const conqueringCountryIds: number[] = [];

    Object.values(dbUpdates.countryStatChanges).forEach((countryHistoryBuilder: CountryHistoryBuilder) => {
      const priorHistory: CountryHistoryRow | undefined = dbStates.countryHistories.find(
        (country: CountryHistoryRow) => country.countryId === countryHistoryBuilder.countryId
      );

      if (!priorHistory) {
        terminalLog(`Country History not found for ${countryHistoryBuilder.countryId}`);

      } else {
        countryHistoryBuilder.copyCountryHistory(priorHistory);
        countryHistoryBuilder.processChanges();
        if (countryHistoryBuilder.countryStatus === CountryStatus.ELIMINATED) {
          conqueringCountryIds.push(countryHistoryBuilder.capitalControllerId);
          this.transferRemainingProvinces(
            countryHistoryBuilder.countryId,
            countryHistoryBuilder.capitalControllerId,
            dbStates,
            dbUpdates
          );
        }

        const countryHistory: CountryHistoryRow = countryHistoryBuilder.build();

        dbUpdates.countryHistories[countryHistoryBuilder.countryId] = countryHistory;
      }
    });

    // All countries that control any units or provinces have an update entry at this point
    conqueringCountryIds.forEach((conqueringCountryId: number) => {
      const pendingCountryHistory: CountryHistoryRow | undefined = dbUpdates.countryHistories[conqueringCountryId];
      pendingCountryHistory.voteCount++;
    });

    // countryStatCounts.forEach((countryStats: CountryStatCounts) => {
    //   let countryHistory: CountryHistoryRow | undefined = dbUpdates.countryHistories[countryStats.countryId];
    //   if (!countryHistory) {
    //     const countryHistoryRow = dbStates.countryHistories.find(
    //       (country: CountryHistoryRow) => country.countryId === countryStats.countryId
    //     );

    //     if (countryHistoryRow) {
    //       countryHistory = this.copyCountryHistory(countryHistoryRow);
    //     }
    //   }

    //   if (!countryHistory) {
    //     terminalLog(`Country History not found for ${countryStats.countryId}`);
    //   } else if (
    //     countryHistory.cityCount !== countryStats.cityCount ||
    //     countryHistory.unitCount !== countryStats.unitCount ||
    //     countryHistory.voteCount !== countryStats.voteCount
    //   ) {
    //     countryHistory.cityCount = countryStats.cityCount;
    //     countryHistory.unitCount = countryStats.unitCount;
    //     countryHistory.adjustments = countryStats.adjustments;
    //     countryHistory.voteCount = countryHistory.newCapitals
    //       ? countryStats.voteCount + countryHistory.newCapitals
    //       : countryStats.voteCount;

    //     if (
    //       countryStats.cityCount === 0 &&
    //       countryStats.unitCount === 0 &&
    //       countryStats.voteCount === 1 &&
    //       countryStats.occupyingCountryId !== countryHistory.countryId
    //     ) {
    //       this.eliminateCountry(countryHistory, countryStats, dbStates, dbUpdates, turn);
    //     } else {
    //       dbUpdates.countryHistories[countryStats.countryId] = countryHistory;
    //     }
    //   }
    // });

    // // if (Object.keys(dbUpdates.countryHistories).length > 0) {
    // //   postStatCheckPromises.push(db.resolutionRepo.insertCountryHistories(dbUpdates.countryHistories, turn.turnId));
    // // }

    // // Every turn
    // postStatCheckPromises.push(db.resolutionRepo.updateOrderSets(dbUpdates.orderSets, turn.turnId));

    // // Find next turn will require an updated gameState first
    // console.log('DB: Turn Update'); // Pending resolution
    // postStatCheckPromises.push(db.resolutionRepo.updateTurnProgress(turn.turnId, TurnStatus.RESOLVED));
  }

  creditCountryWithUnit(unitHistory: UnitHistoryRow, dbUpdates: DbUpdates) {
    if (!unitHistory.countryId) {
      terminalLog(`Unit ${unitHistory.unitId} has no countryId`);
      return;
    }

    const countryChanges = dbUpdates.countryStatChanges[unitHistory.countryId];
    if (countryChanges) {
      countryChanges.unitCount = countryChanges.unitCount ? countryChanges.unitCount + 1 : 1;

    } else {
      dbUpdates.countryStatChanges[unitHistory.countryId] = new CountryHistoryBuilder({
        countryId: unitHistory.countryId,
        unitCount: 1
      });
    }
  }

  creditCountryWithProvince(provinceHistory: ProvinceHistoryRow, dbUpdates: DbUpdates, survivingCountryIds: Set<number>) {
    if (provinceHistory.controllerId && provinceHistory.provinceStatus === ProvinceStatus.ACTIVE) {
      this.creditCountryWithSupplyCenter(provinceHistory, dbUpdates);
    }

    if (provinceHistory.controllerId && provinceHistory.cityType &&
      provinceHistory.cityType === CityType.VOTE &&
      provinceHistory.provinceStatus !== ProvinceStatus.DORMANT
    ) {
      this.creditCountryWithVote(provinceHistory, dbUpdates);
    }

    if (provinceHistory.controllerId &&
      provinceHistory.capitalOwnerId &&
      provinceHistory.cityType &&
      provinceHistory.cityType === CityType.CAPITAL
    ) {
      this.creditCountriesWithCapital(provinceHistory, dbUpdates, survivingCountryIds);
    }
  }

  creditCountryWithSupplyCenter(provinceHistory: ProvinceHistoryRow, dbUpdates: DbUpdates) {
    if (!provinceHistory.controllerId) {
      terminalLog(`Province ${provinceHistory.provinceId} has no controllerId`);
      return;
    }

    const countryChanges = dbUpdates.countryStatChanges[provinceHistory.controllerId];
    if (countryChanges) {
      countryChanges.cityCount = countryChanges.cityCount ? countryChanges.cityCount + 1 : 1;

    } else { // If countryAsset doesn't exist, that means no unit or province has a history at this point
      dbUpdates.countryStatChanges[provinceHistory.controllerId] = new CountryHistoryBuilder({
        countryId: provinceHistory.controllerId,
        cityCount: 1
      });
    }
  }

  creditCountryWithVote(provinceHistory: ProvinceHistoryRow, dbUpdates: DbUpdates) {
    if (!provinceHistory.controllerId) {
      terminalLog(`Province ${provinceHistory.provinceId} has no controllerId`);
      return;
    }

    const countryChanges = dbUpdates.countryStatChanges[provinceHistory.controllerId];
    if (countryChanges) {
      countryChanges.voteCount = countryChanges.voteCount ? countryChanges.voteCount + 1 : 1;

    } else {
      dbUpdates.countryStatChanges[provinceHistory.controllerId] = new CountryHistoryBuilder({
        countryId: provinceHistory.controllerId,
        voteCount: 1
      });
    }
  }

  /**
   * Increments vote count for either the controller or capital owner if not eliminated. Sets controlsCapital flag.
   *
   * @param provinceHistory
   * @param dbUpdates
   * @param survivingCountryIds
   * @returns
   */
  creditCountriesWithCapital(provinceHistory: ProvinceHistoryRow, dbUpdates: DbUpdates, survivingCountryIds: Set<number>) {
    if (!provinceHistory.controllerId) {
      terminalLog(`Province ${provinceHistory.provinceId} has no controllerId`);
      return;
    }

    if (!provinceHistory.capitalOwnerId) {
      terminalLog(`Province ${provinceHistory.provinceId} has no capitalOwnerId`);
      return;
    }

    let controllerChanges = dbUpdates.countryStatChanges[provinceHistory.controllerId];
    let ownerChanges = dbUpdates.countryStatChanges[provinceHistory.capitalOwnerId];

    if (!controllerChanges) {
      controllerChanges = new CountryHistoryBuilder({
        countryId: provinceHistory.controllerId,
        voteCount: 0
      });
    }

    if (!ownerChanges) {
      ownerChanges = new CountryHistoryBuilder({
        countryId: provinceHistory.capitalOwnerId,
        voteCount: 0
      });
    }

    const countryThatGetsVote =
      (provinceHistory.controllerId === provinceHistory.capitalOwnerId || survivingCountryIds.has(provinceHistory.capitalOwnerId))
      ? ownerChanges
      : controllerChanges;

    countryThatGetsVote.voteCount = countryThatGetsVote.voteCount ? countryThatGetsVote.voteCount + 1 : 1;
    ownerChanges.controlsCapital = provinceHistory.controllerId === provinceHistory.capitalOwnerId;
    ownerChanges.capitalControllerId = ownerChanges.controlsCapital ? provinceHistory.capitalOwnerId : provinceHistory.controllerId;
  }
}
