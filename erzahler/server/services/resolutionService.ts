import { db } from "../../database/connection";
import { OrderDisplay } from "../../models/enumeration/order-display-enum";
import { TurnStatus } from "../../models/enumeration/turn-status-enum";
import { TurnType } from "../../models/enumeration/turn-type-enum";
import { TurnTS } from "../../models/objects/database-objects";
import { StartDetails } from "../../models/objects/initial-times-object";
import { GameState } from "../../models/objects/last-turn-info-object";
import { OptionDestination, SavedOption, SecondaryUnit, UnitOptionsFinalized } from "../../models/objects/option-context-objects";
import { UnitOrderResolution } from "../../models/objects/resolution/order-resolution-objects";
import { UpcomingTurn } from "../../models/objects/scheduler/upcoming-turns-object";
import { OptionsService } from "./options-service";

export class ResolutionService {
  optionService: OptionsService = new OptionsService();

  async startGame(gameData: any, startDetails: StartDetails): Promise<void> {
    const optionsService = new OptionsService();
    const turnNameSplit = TurnType.SPRING_ORDERS.split(' ');
    const firstTurn: TurnTS = {
      gameId: gameData.gameId,
      turnNumber: 1,
      turnName: `${turnNameSplit[0]} ${gameData.stylizedStartYear + 1} ${turnNameSplit[1]}`,
      turnType: TurnType.SPRING_ORDERS,
      turnStatus: TurnStatus.PENDING,
      yearNumber: 1,
      deadline: startDetails.firstTurn
    };
    const nextTurn: TurnTS = await db.schedulerRepo.insertTurn(firstTurn);

    if (nextTurn.turnId) {
      await optionsService.saveOptionsForNextTurn(gameData.gameId, nextTurn.turnId);
    }
    // Alert service call
  }

  async resolveTurn(turn: UpcomingTurn): Promise<void> {
    const turnsWithUnitOrders = [
      TurnType.ORDERS_AND_VOTES,
      TurnType.SPRING_ORDERS,
      TurnType.SPRING_RETREATS,
      TurnType.FALL_ORDERS,
      TurnType.FALL_RETREATS
    ];
    const turnsWithTransfers = [TurnType.ORDERS_AND_VOTES, TurnType.SPRING_ORDERS]; // Can add a check for future Transfer in Fall rule and push turn type, if desired
    const turnsWithAdjustments = [TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM];
    const turnsWithNominations = [TurnType.ADJ_AND_NOM, TurnType.NOMINATIONS];
    const turnsWithVotes = [TurnType.ORDERS_AND_VOTES, TurnType.VOTES];

    const gameState: GameState = await db.gameRepo.getGameState(turn.gameId);

    if (turnsWithUnitOrders.includes(turn.turnType)) {
      this.resolveUnitMovement(gameState, turn);
    }

    if (turnsWithTransfers.includes(turn.turnType)) {
      this.resolveTransfers(gameState, turn);
    }

    if (turnsWithAdjustments.includes(turn.turnType)) {
      this.resolveAdjustments(gameState, turn);
    }

    if (turnsWithNominations.includes(turn.turnType)) {
      this.resolveNominations(gameState, turn);
    }

    if (turnsWithVotes.includes(turn.turnType)) {
      this.resolveVotes(gameState, turn);
    }


    // Fetch turn to filter compatible orders
    // New get query would be needed which includes detailed information
    // Game state and the orders for validation and broadcast

    // Validate possibility of moves
      // Options array query
      // Tech Possesion
      // Build Counts
      // Country Nomination Status
      // Coalition Integrity

    // Update Turn and Preliminary Status
    // Trigger Set Defaults
    // Check Preliminary invalidation
  }

  async resolveUnitMovement(gameState: GameState, turn: UpcomingTurn): Promise<void> {
    const unitOptions = this.optionService.finalizeUnitOptions(
      await db.optionsRepo.getUnitOptions(gameState.turnId, turn.turnId, 0)
    );

    const unitOrders: UnitOrderResolution[] = await db.resolutionRepo.getUnitOrdersForResolution(gameState.turnId, turn.turnId);

    // Order Possibility Verification
    unitOrders.forEach((order: UnitOrderResolution) => {
      this.validateUnitOrder(order, unitOptions);
    });

    // Check successes by order of operations
      // Units
        // Compliance
        // Nukes
        // Support Cut
        // Convoy
        // Movement
      // Tech Transfer
        // Compliance
      // Build Transfer
        // Counts

  }



  validateUnitOrder(order: UnitOrderResolution, unitOptions: UnitOptionsFinalized[]) {
    const options: UnitOptionsFinalized | undefined = unitOptions.find((option: UnitOptionsFinalized) => option.unitId === order.orderedUnitId);

    if (options === undefined) {
      console.log(`orderId ${order.orderId} with unitId ${order.orderedUnitId} doesn't even have matching options. This should be impossible but here we are!`);

      this.invalidateOrder(order, `Incredibly Invalid`);
    } else if (!options.orderTypes.includes(order.orderType)) {
      this.invalidateOrder(order, `Invalid Order Type`);
    } else if (order.orderType === OrderDisplay.MOVE) {
      const destinationIds = options.moveDestinations.map((destination: OptionDestination) => destination.nodeId);

      if (!destinationIds.includes(order.destinationId)) {
        this.invalidateOrder(order, `Invalid Destination`);
      }
    } else if (order.orderType === OrderDisplay.MOVE_CONVOYED) {
      const destinationIds = options.moveTransportedDestinations.map((destination: OptionDestination) => destination.nodeId);

      if (!destinationIds.includes(order.destinationId)) {
        this.invalidateOrder(order, `Invalid Destination`);
      }
    } else if (order.orderType === OrderDisplay.DETONATE) {
      const targetIds = options.nukeTargets.map((destination: OptionDestination) => destination.nodeId);

      if (!targetIds.includes(order.destinationId)) {
        this.invalidateOrder(order, `Invalid Target`);
      }
    } else if (order.orderType === OrderDisplay.SUPPORT) {
      const supportableUnitIds = options.supportStandardUnits.map((unit: SecondaryUnit) => unit.id);

      if (!supportableUnitIds.includes(order.secondaryUnitId)) {
        this.invalidateOrder(order, 'Invalid Support Unit');
      } else {
        const supportDestinationIds =
          options.supportStandardDestinations[order.secondaryUnitId].map((destination: OptionDestination) => destination.nodeId);

        if (!supportDestinationIds.includes(order.destinationId)) {
          this.invalidateOrder(order, 'Invalid Support Destination');
        }
      }
    } else if (order.orderType === OrderDisplay.SUPPORT_CONVOYED) {
      const supportableUnitIds = options.supportTransportedUnits.map((unit: SecondaryUnit) => unit.id);

      if (!supportableUnitIds.includes(order.secondaryUnitId)) {
        this.invalidateOrder(order, 'Invalid Support Unit');
      } else {
        const supportDestinationIds =
          options.supportTransportedDestinations[order.secondaryUnitId].map((destination: OptionDestination) => destination.nodeId);

        if (!supportDestinationIds.includes(order.destinationId)) {
          this.invalidateOrder(order, 'Invalid Support Destination');
        }
      }
    } else if ([OrderDisplay.AIRLIFT, OrderDisplay.CONVOY].includes(order.orderType)) {
      const transportableUnitIds = options.transportableUnits.map((unit: SecondaryUnit) => unit.id);

      if (!transportableUnitIds.includes(order.secondaryUnitId)) {
        this.invalidateOrder(order, `Invalid ${order.orderType} Unit`);
      } else {
        const transportDestinationIds =
          options.transportDestinations[order.secondaryUnitId].map((destination: OptionDestination) => destination.nodeId);

        if (!transportDestinationIds.includes(order.destinationId)) {
          this.invalidateOrder(order, `Invalid ${order.orderType} Destination`);
        }
      }
    }
  }

  invalidateOrder(order: UnitOrderResolution, failureDescription: string) {
    order.valid = false;
    order.primaryResolution = failureDescription;
    order.destinationId = 0;
    order.orderType = OrderDisplay.HOLD;
  }

  async resolveTransfers(gameState: GameState, turn: UpcomingTurn): Promise<void> {

  }

  async resolveAdjustments(gameState: GameState, turn: UpcomingTurn): Promise<void> {

  }

  async resolveNominations(gameState: GameState, turn: UpcomingTurn): Promise<void> {

  }

  async resolveVotes(gameState: GameState, turn: UpcomingTurn): Promise<void> {

  }


}