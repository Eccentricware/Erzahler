import { Pool, QueryResult } from "pg";
import { getGameStateQuery } from "../../database/queries/orders/get-game-state-query";
import { getAirAdjQuery } from "../../database/queries/orders/get-air-adj-query";
import { GameState, GameStateResult, NextTurns } from "../../models/objects/last-turn-info-object";
import { AdjacenctMovement, AdjacenctMovementResult, AirAdjacency, HoldSupport, OptionDestination, OptionsContext, OrderOption, SavedDestination, SavedOption, SecondaryUnit, TransportPathLink, UnitAdjacyInfoResult, UnitOptionsFinalized, UnitOptions, TransferOption, BuildLoc, AtRiskUnit, NominatableCountry, Nomination, OrderPrepping, OrderSet, Order, TransferCountry, BuildLocResult } from "../../models/objects/option-context-objects";
import { victorCredentials } from "../../secrets/dbCredentials";
import { copyObjectOfArrays, mergeArrays } from "./data-structure-service";
import { BuildType, UnitType } from "../../models/enumeration/unit-enum";
import { db } from "../../database/connection";
import { OrderDisplay } from "../../models/enumeration/order-display-enum";
import { AccountService } from "./accountService";
import { AssignmentService } from "./assignmentService";
import { SchedulerService } from "./scheduler-service";
import { UpcomingTurn } from "../../models/objects/scheduler/upcoming-turns-object";
import { TurnType } from "../../models/enumeration/turn-type-enum";
import { stringify } from "querystring";
import { TurnStatus } from "../../models/enumeration/turn-status-enum";
import { UserAssignment } from "../../models/objects/assignment-objects";
import { AssignmentType } from "../../models/enumeration/assignment-type-enum";
import { CountryStatus } from "../../models/enumeration/country-enum";
import { CountryState } from "../../models/objects/games/country-state-objects";
import { BuildOptions, OptionsFinal, TransferBuildsCountry } from "../../models/objects/options-objects";
import { Build, BuildOrders, DisbandOrders, NukeBuildInDisband, TransferTechOrder, TurnOrders } from "../../models/objects/order-objects";
import { CountryOrderSet, OrderTurnIds } from "../../models/objects/orders/expected-order-types-object";
import assert from "assert";

export class OrdersService {
  async getTurnOrders(idToken: string, gameId: number): Promise<TurnOrders> {
    // Identify user
    const accountService = new AccountService();

    const userId = await accountService.getUserIdFromToken(idToken);
    const gameState = await db.gameRepo.getGameState(gameId);
    // Identify Player Type (Player, Admin, Spectator)

    const playerAssignments = await db.assignmentRepo.getUserAssignments(gameId, userId);
    // Identify Turn Type
    const playerCountries = playerAssignments.filter((assignment: UserAssignment) =>
      assignment.assignmentType === AssignmentType.PLAYER
    );

    const adminAssignments = playerAssignments.filter((assignment: UserAssignment) => {
      return (assignment.blindAdministrators === false
        && (
          (assignment.assignmentType && [AssignmentType.ADMINISTRATOR, AssignmentType.CREATOR].includes(assignment.assignmentType))
          || assignment.username === 'Zeldark'
        )
      )
    });

    const adminVision = adminAssignments.length > 0;

    const orders: TurnOrders = {
      gameId: gameId,
      userId: userId,
      render: 'pending',
      countryId: 0
    };

    if (playerCountries.length > 0) {
      orders.role === 'player';
      const countryStates = await db.gameRepo.getCountryState(gameId, playerCountries[0].countryId);
      let playerCountry: CountryState = countryStates[0];
      orders.countryId = playerCountry.countryId;

      let pendingTurn: UpcomingTurn | undefined = undefined;
      let preliminaryTurn: UpcomingTurn | undefined = undefined;

      const upcomingTurns: UpcomingTurn[] = await db.schedulerRepo.getUpcomingTurns(gameId);

      if (upcomingTurns.length === 0) {
        console.log(`GameId ${gameId} has no upcoming turns!`);
      }

      if (upcomingTurns.length > 0) {
        pendingTurn = upcomingTurns[0];
      }

      if (upcomingTurns.length === 2) {
        preliminaryTurn = upcomingTurns[1];
      }

      if (upcomingTurns.length > 2) {
        console.log(`GameId ${gameId} has too many upcoming turns! (${upcomingTurns.length})`);
      }

      if (pendingTurn) {
        // Move back
        const pendingDisbandOrders: DisbandOrders = await this.prepareDisbandOrders(gameState.turnId, pendingTurn.turnId, playerCountry.countryId);
        orders.disbands = pendingDisbandOrders;
        ////
        // Standard Unit Movement
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(pendingTurn.turnType)) {

          orders.units = await db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, pendingTurn.turnId, gameState.turnId);
          if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
            orders.pendingDefault = false;
          } else {
            orders.pendingDefault = true;
          }
        }

        // Retreating Unit Movement
        if ([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType)) {
          if (playerCountry.countryStatus === CountryStatus.RETREAT) {
            orders.units = await db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, pendingTurn.turnId, gameState.turnId);
            if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
              orders.pendingDefault = false;
            } else {
              orders.pendingDefault = true;
            }
          } else {
            orders.render === 'preliminary';
          }
        }

        // Transfers
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
          const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartner(pendingTurn.turnId, gameState.turnId, playerCountry.countryId);
          orders.techTransfer = techTransferOrders[0];

          const pendingBuildTransferOrders: TransferBuildsCountry[] = await db.ordersRepo.getBuildTransferOrders(playerCountry.countryId, pendingTurn.turnId);
          orders.buildTransfers = pendingBuildTransferOrders;
        }

        // Adjustments
        if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
          if (playerCountry.adjustments >= 0) {
            const pendingBuildOrders: BuildOrders[] = await db.ordersRepo.getBuildOrders(gameState.turnId, pendingTurn.turnId, playerCountry.countryId);
            orders.builds = pendingBuildOrders[0];
          } else {
            const pendingDisbandOrders: DisbandOrders = await db.ordersRepo.getDisbandOrders(gameState.turnId, pendingTurn.turnId, playerCountry.countryId);
            orders.disbands = pendingDisbandOrders;
          }
        }

        // Nominations
        if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
          // const pendingNominatableCountries: NominatableCountry[] = await db.ordersRepo.getNominatableCountries(gameState.turnId);
        }

        // Votes
        if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
          // const pendingNominations: Nomination[] = await db.ordersRepo.getNominations(gameState.turnId);
        }
      }

      if (preliminaryTurn) {
        // Units
        if ([
          TurnType.SPRING_ORDERS,
          TurnType.ORDERS_AND_VOTES,
          TurnType.FALL_ORDERS,
        ].includes(preliminaryTurn.turnType)) {
          orders.units = await db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, preliminaryTurn.turnId, gameState.turnId);
          if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
            orders.preliminaryDefault = false;
          } else {
            orders.preliminaryDefault = true;
          }
        }

        // Transfers
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
          const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartner(preliminaryTurn.turnId, gameState.turnId, playerCountry.countryId);
          orders.techTransfer = techTransferOrders[0];

          const pendingBuildTransferOrders: TransferBuildsCountry[] = await db.ordersRepo.getBuildTransferOrders(playerCountry.countryId, preliminaryTurn.turnId);
          orders.buildTransfers = pendingBuildTransferOrders;
        }

        // Adjustments
        if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
          // const preliminaryBuildLocs: BuildLoc[] = await db.ordersRepo.getAvailableBuildLocs(gameId, gameState.turnId, playerCountry.countryId);
          // const preliminaryAtRiskUnits: AtRiskUnit[] = await db.ordersRepo.getAtRiskUnits(gameState.turnId, playerCountry.countryId);
        }

        // Nominations
        if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
          // const preliminaryNominatableCountries: NominatableCountry[] = await db.ordersRepo.getNominatableCountries(gameState.turnId);
        }
      }
    }
    else if (adminVision)  {
      let playerCountry: CountryState;
      if (playerCountries[0]) {
        const countryStates = await db.gameRepo.getCountryState(gameId, playerCountries[0].countryId);
        playerCountry = countryStates[0];
      } else {
        playerCountry = {
          countryId: 0,
          name: 'Administrator',
          unitCount: -1,
          cityCount: -1,
          builds: -1,
          nukeRange: -1,
          adjustments: -1,
          countryStatus: 'Administrator',
          retreating: false,
          nukesInProduction: 0
        }
      }

      let pendingTurn: UpcomingTurn | undefined = undefined;
      let preliminaryTurn: UpcomingTurn | undefined = undefined;

      const upcomingTurns: UpcomingTurn[] = await db.schedulerRepo.getUpcomingTurns(gameId);

      if (upcomingTurns.length === 0) {
        console.log(`GameId ${gameId} has no upcoming turns!`);
      }

      if (upcomingTurns.length > 0) {
        pendingTurn = upcomingTurns[0];
      }

      if (upcomingTurns.length === 2) {
        preliminaryTurn = upcomingTurns[1];
      }

      if (upcomingTurns.length > 2) {
        console.log(`GameId ${gameId} has too many upcoming turns! (${upcomingTurns.length})`);
      }

      if (pendingTurn) {
        // Standard Unit Movement
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(pendingTurn.turnType)) {
          orders.units = await db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, pendingTurn.turnId, gameState.turnId);
          if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
            orders.pendingDefault = false;
          } else {
            orders.pendingDefault = true;
          }
        }

        // Retreating Unit Movement
        if ([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType)) {
          if (playerCountry.countryStatus === CountryStatus.RETREAT) {
            orders.units = await db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, pendingTurn.turnId, gameState.turnId);
            if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
              orders.pendingDefault = false;
            } else {
              orders.pendingDefault = true;
            }
          } else {
            orders.render === 'preliminary';
          }
        }

        // Transfers
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
          const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartner(pendingTurn.turnId, gameState.turnId, playerCountry.countryId);
          orders.techTransfer = techTransferOrders[0];

          const pendingBuildTransferOrders: TransferBuildsCountry[] = await db.ordersRepo.getBuildTransferOrders(playerCountry.countryId, pendingTurn.turnId);
          orders.buildTransfers = pendingBuildTransferOrders;
        }

        // Adjustments
        if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
          if (playerCountry.adjustments >= 0) {
            const pendingBuildOrders: BuildOrders[] = await db.ordersRepo.getBuildOrders(pendingTurn.turnId, gameState.turnId, playerCountry.countryId);
            orders.builds = pendingBuildOrders[0];
          } else {
            // const preliminaryAtRiskUnits: AtRiskUnit[] = await db.ordersRepo.getAtRiskUnits(gameState.turnId, playerCountry.countryId);
          }
        }

        // Nominations
        if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
          // const pendingNominatableCountries: NominatableCountry[] = await db.ordersRepo.getNominatableCountries(gameState.turnId);
        }

        // Votes
        if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
          // const pendingNominations: Nomination[] = await db.ordersRepo.getNominations(gameState.turnId);
        }
      }

      if (preliminaryTurn) {
        // Units
        if ([
          TurnType.SPRING_ORDERS,
          TurnType.ORDERS_AND_VOTES,
          TurnType.FALL_ORDERS,
        ].includes(preliminaryTurn.turnType)) {
          orders.units = await db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, preliminaryTurn.turnId, gameState.turnId);
          if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
            orders.preliminaryDefault = false;
          } else {
            orders.preliminaryDefault = true;
          }
        }

        // Transfers
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
          const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartner(preliminaryTurn.turnId, gameState.turnId, playerCountry.countryId);
          orders.techTransfer = techTransferOrders[0];

          const pendingBuildTransferOrders: TransferBuildsCountry[] = await db.ordersRepo.getBuildTransferOrders(playerCountry.countryId, preliminaryTurn.turnId);
          orders.buildTransfers = pendingBuildTransferOrders;
        }

        // Adjustments
        if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
          // const preliminaryBuildLocs: BuildLoc[] = await db.ordersRepo.getAvailableBuildLocs(gameId, gameState.turnId, playerCountry.countryId);
          // const preliminaryAtRiskUnits: AtRiskUnit[] = await db.ordersRepo.getAtRiskUnits(gameState.turnId, playerCountry.countryId);
        }

        // Nominations
        if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
          // const preliminaryNominatableCountries: NominatableCountry[] = await db.ordersRepo.getNominatableCountries(gameState.turnId);
        }
      }
    }

    return orders;
  }

  async getOrderSets(gameId: number, countryId: number): Promise<OrderTurnIds> {
    const gameState: GameState = await db.gameRepo.getGameState(gameId);
    const countryOrderSets: CountryOrderSet[] = await db.ordersRepo.getCountryOrderSets(gameId, gameState.turnId, countryId);
    const pendingOrderSet: CountryOrderSet | undefined
      = countryOrderSets.find((orderSet: CountryOrderSet) => orderSet.turnStatus === TurnStatus.PENDING);
    const preliminaryOrderSet: CountryOrderSet | undefined
      = countryOrderSets.find((orderSet: CountryOrderSet) => orderSet.turnStatus === TurnStatus.PRELIMINARY);

    const turnIds: OrderTurnIds = {};

    if (pendingOrderSet) {
      // Standard Unit Movement
      if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(pendingOrderSet.turnType)) {
        turnIds.units = pendingOrderSet.orderSetId;
      }

      // Retreating Unit Movement
      if ([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingOrderSet.turnType) && pendingOrderSet.inRetreat) {
        turnIds.retreats = pendingOrderSet.orderSetId;
      }

      // Transfers
      if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(pendingOrderSet.turnType)) {
        turnIds.transfers = pendingOrderSet.orderSetId;
      }

      // Adjustments
      if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(pendingOrderSet.turnType)) {
        if (pendingOrderSet.adjustments >= 0) {
          turnIds.builds = pendingOrderSet.orderSetId;
        } else {
          turnIds.disbands = pendingOrderSet.orderSetId;
        }
      }

      // Nominations
      if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(pendingOrderSet.turnType)) {
        turnIds.nomination = pendingOrderSet.orderSetId;
      }

      // Votes
      if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(pendingOrderSet.turnType)) {
        turnIds.votes = pendingOrderSet.orderSetId;
      }
    }

    if (preliminaryOrderSet) {
      // Standard Unit Movement
      if ([TurnType.SPRING_ORDERS, TurnType.FALL_ORDERS].includes(preliminaryOrderSet.turnType)) {
        turnIds.units = preliminaryOrderSet.orderSetId;
      }

      // Transfers
      if ([TurnType.SPRING_ORDERS].includes(preliminaryOrderSet.turnType)) {
        turnIds.transfers = preliminaryOrderSet.orderSetId;
      }

      // Nominations
      if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(preliminaryOrderSet.turnType)) {
        turnIds.nomination = preliminaryOrderSet.orderSetId;
      }
    }

    return turnIds;
  }

  async saveOrders(idToken: string, orders: TurnOrders): Promise<any> {
    // Identify user
    const accountService = new AccountService();

    const userId = await accountService.getUserIdFromToken(idToken);
    const userAssigned = await db.assignmentRepo.confirmUserIsCountry(orders.gameId, userId, orders.countryId);
    if (userAssigned) {
      const orderSetIds: OrderTurnIds = await this.getOrderSets(orders.gameId, orders.countryId);
      orderSetIds.disbands = 542;

      // if (orderSetIds.votes && orders.votes) {
      //   orders.votes.forEach((vote: Order) => {
      //     db.ordersRepo.saveVoteOrder(vote, orderSetIds.votes);
      //   });
      // }

      if (orderSetIds.units && orders.units) {
        orders.units.forEach(async (unit: Order) => {
          assert(orderSetIds.units);
          await db.ordersRepo.saveUnitOrder(orderSetIds.units, unit);
        });
      }

      if (orderSetIds.transfers && orders.techTransfer && orders.buildTransfers) {
        await db.ordersRepo.saveTransfers(orderSetIds.transfers, orders.techTransfer, orders.buildTransfers);
      }

      // if (orderSetIds.retreats && orders.units) {
      //   orders.units.forEach((unit: Order) => {
      //     assert(orderSetIds.units);
      //     db.ordersRepo.saveUnitOrder(orderSetIds.units, unit);
      //   });
      // }

      if (orderSetIds.builds && orders.builds) {
        db.ordersRepo.saveBuildOrders(orderSetIds.builds, orders.builds);
      }

      if (orderSetIds.units && orders.disbands) {
        db.ordersRepo.saveDisbandOrders(orderSetIds.units, orders.disbands);
      }

      // if (orderSetIds.nomination && orders.nomination) {
      //   db.ordersRepo.saveNominationOrder(orders.nomination, orderSetIds.nomination);
      // }
    }
  }

  async prepareDisbandOrders(currentTurnId: number, pendingTurnId: number, countryId: number): Promise<DisbandOrders> {
    const disbandOrders: DisbandOrders = await db.ordersRepo.getDisbandOrders(currentTurnId, pendingTurnId, countryId);

    if (disbandOrders.nukeLocs.length > 0) {
      disbandOrders.nukeBuildDetails = await db.ordersRepo.getNukesReadyLocs(pendingTurnId, countryId);

      if (disbandOrders.nukeBuildDetails && disbandOrders.nukeBuildDetails.length < disbandOrders.nukeLocs.length) {
        while (disbandOrders.nukeBuildDetails.length < disbandOrders.nukeLocs.length) {
          disbandOrders.nukeBuildDetails.unshift({
            unitId: disbandOrders.nukeBuildDetails.length * -1,
            nodeId: 0,
            province: '---',
            display: '---',
            nodeLoc: [0, 0]
          });
        }

        if (disbandOrders.unitDisbandingDetailed.length < disbandOrders.unitsDisbanding.length) {
          disbandOrders.nukeBuildDetails.forEach((nuke: NukeBuildInDisband, index: number) => {
            if (nuke.nodeId === 0) {
              disbandOrders.unitDisbandingDetailed.unshift({
                unitId: index * -1,
                unitType: UnitType.NUKE,
                provinceName: nuke.province,
                loc: nuke.nodeLoc
              });
            }
          })
        }
      }
    }

    // const disbandingUnitDetails: DisbandingUnitDetail = db.ordersRepo.getDisbandingUnitDetails()

    return disbandOrders;
  }
}