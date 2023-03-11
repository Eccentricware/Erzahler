import { GameState } from '../../models/objects/last-turn-info-object';
import { NominatableCountry, Order } from '../../models/objects/option-context-objects';
import { UnitType } from '../../models/enumeration/unit-enum';
import { db } from '../../database/connection';
import { AccountService } from './accountService';
import { UpcomingTurn } from '../../models/objects/scheduler/upcoming-turns-object';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { UserAssignment } from '../../models/objects/assignment-objects';
import { AssignmentType } from '../../models/enumeration/assignment-type-enum';
import { CountryStatus } from '../../models/enumeration/country-enum';
import { CountryState } from '../../models/objects/games/country-state-objects';
import {
  BuildOrders,
  DisbandOrders,
  NominationOrder,
  NukeBuildInDisband,
  TransferBuildOrder,
  TransferTechOrder,
  TurnOrders
} from '../../models/objects/order-objects';
import { CountryOrderSet, OrderTurnIds } from '../../models/objects/orders/expected-order-types-object';
import assert from 'assert';

export class OrdersService {
  async getTurnOrders(idToken: string, gameId: number): Promise<TurnOrders> {
    // Identify user
    const accountService = new AccountService();

    const userId = await accountService.getUserIdFromToken(idToken);
    const gameState = await db.gameRepo.getGameState(gameId);
    // Identify Player Type (Player, Admin, Spectator)

    const playerAssignments = await db.assignmentRepo.getUserAssignments(gameId, userId);
    // Identify Turn Type
    const playerCountries = playerAssignments.filter(
      (assignment: UserAssignment) => assignment.assignmentType === AssignmentType.PLAYER
    );

    const adminAssignments = playerAssignments.filter((assignment: UserAssignment) => {
      return (
        assignment.blindAdministrators === false &&
        ((assignment.assignmentType &&
          [AssignmentType.ADMINISTRATOR, AssignmentType.CREATOR].includes(assignment.assignmentType)) ||
          assignment.username === 'Zeldark')
      );
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
      const countryStates = await db.gameRepo.getCountryState(
        gameId,
        gameState.turnNumber,
        playerCountries[0].countryId
      );
      const playerCountry: CountryState = countryStates[0];
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
        // Standard Unit Movement
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(pendingTurn.turnType)) {
          orders.units = await db.ordersRepo.getTurnUnitOrders(
            gameId,
            gameState.turnNumber,
            pendingTurn.turnId,
            playerCountry.countryId
          );
          if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
            orders.pendingDefault = false;
          } else {
            orders.pendingDefault = true;
          }
        }

        // Retreating Unit Movement
        if ([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType)) {
          if (playerCountry.countryStatus === CountryStatus.RETREAT) {
            orders.units = await db.ordersRepo.getTurnUnitOrders(
              gameId,
              gameState.turnNumber,
              pendingTurn.turnId,
              playerCountry.countryId
            );
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
          const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartner(
            pendingTurn.turnId,
            gameState.turnId,
            playerCountry.countryId
          );
          orders.techTransfer = techTransferOrders[0];

          const pendingBuildTransferOrders: TransferBuildOrder[] = await db.ordersRepo.getBuildTransferOrders(
            playerCountry.countryId,
            pendingTurn.turnId
          );
          orders.buildTransfers = pendingBuildTransferOrders;
        }

        // Adjustments
        if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
          if (playerCountry.adjustments >= 0) {
            const pendingBuildOrders: BuildOrders[] = await db.ordersRepo.getBuildOrders(
              gameState.gameId,
              gameState.turnNumber,
              pendingTurn.turnId,
              playerCountry.countryId
            );
            orders.builds = pendingBuildOrders[0];
          } else {
            orders.disbands = await this.prepareDisbandOrders(
              gameState.turnId,
              pendingTurn.turnId,
              playerCountry.countryId
            );
          }
        }

        // Nominations
        if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
          orders.nomination = await this.getNominationOrder(pendingTurn.turnId, playerCountry.countryId);
        }

        // Votes
        if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
          orders.votes = {
            nominations: await db.ordersRepo.getVotes(pendingTurn.turnId, playerCountry.countryId)
          };
        }
      }

      if (preliminaryTurn) {
        // Units
        if (
          [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(preliminaryTurn.turnType)
        ) {
          orders.units = await db.ordersRepo.getTurnUnitOrders(
            gameId,
            gameState.turnNumber,
            preliminaryTurn.turnId,
            playerCountry.countryId
          );
          if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
            orders.preliminaryDefault = false;
          } else {
            orders.preliminaryDefault = true;
          }
        }

        // Transfers
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
          const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartner(
            preliminaryTurn.turnId,
            gameState.turnId,
            playerCountry.countryId
          );
          orders.techTransfer = techTransferOrders[0];

          const pendingBuildTransferOrders: TransferBuildOrder[] = await db.ordersRepo.getBuildTransferOrders(
            playerCountry.countryId,
            preliminaryTurn.turnId
          );
          orders.buildTransfers = pendingBuildTransferOrders;
        }

        // Adjustments
        if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
          if (playerCountry.adjustments >= 0) {
            const pendingBuildOrders: BuildOrders[] = await db.ordersRepo.getBuildOrders(
              gameState.gameId,
              gameState.turnNumber,
              preliminaryTurn.turnId,
              playerCountry.countryId
            );
            orders.builds = pendingBuildOrders[0];
          } else {
            orders.disbands = await this.prepareDisbandOrders(
              gameState.turnId,
              preliminaryTurn.turnId,
              playerCountry.countryId
            );
          }
        }

        // Nominations
        if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
          orders.nomination = await this.getNominationOrder(preliminaryTurn.turnId, playerCountry.countryId);
        }
      }
    } else if (adminVision) {
      let playerCountry: CountryState;
      if (playerCountries[0]) {
        const countryStates = await db.gameRepo.getCountryState(
          gameId,
          gameState.turnNumber,
          playerCountries[0].countryId
        );
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
        };
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
          orders.units = await db.ordersRepo.getTurnUnitOrders(
            gameId,
            gameState.turnNumber,
            pendingTurn.turnId,
            playerCountry.countryId
          );
          if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
            orders.pendingDefault = false;
          } else {
            orders.pendingDefault = true;
          }
        }

        // Retreating Unit Movement
        if ([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType)) {
          if (playerCountry.countryStatus === CountryStatus.RETREAT) {
            orders.units = await db.ordersRepo.getTurnUnitOrders(
              gameId,
              gameState.turnNumber,
              pendingTurn.turnId,
              playerCountry.countryId
            );
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
          const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartner(
            pendingTurn.turnId,
            gameState.turnId,
            playerCountry.countryId
          );
          orders.techTransfer = techTransferOrders[0];

          const pendingBuildTransferOrders: TransferBuildOrder[] = await db.ordersRepo.getBuildTransferOrders(
            playerCountry.countryId,
            pendingTurn.turnId
          );
          orders.buildTransfers = pendingBuildTransferOrders;
        }

        // Adjustments
        if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
          if (playerCountry.adjustments >= 0) {
            const pendingBuildOrders: BuildOrders[] = await db.ordersRepo.getBuildOrders(
              gameState.gameId,
              gameState.turnNumber,
              gameState.turnId,
              playerCountry.countryId
            );
            orders.builds = pendingBuildOrders[0];
          } else {
            // const preliminaryAtRiskUnits: AtRiskUnit[] = await db.ordersRepo.getAtRiskUnits(gameState.gameId, gameState.turnNumber, playerCountry.countryId);
          }
        }

        // Nominations
        if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
          // const pendingNominatableCountries: NominatableCountry[] = await db.ordersRepo.getNominatableCountries(gameState.gameId, gameState.turnNumber);
        }

        // Votes
        if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
          // const pendingNominations: Nomination[] = await db.ordersRepo.getNominations(gameState.turnId);
        }
      }

      if (preliminaryTurn) {
        // Units
        if (
          [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(preliminaryTurn.turnType)
        ) {
          orders.units = await db.ordersRepo.getTurnUnitOrders(
            gameId,
            gameState.turnNumber,
            preliminaryTurn.turnId,
            playerCountry.countryId
          );
          if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
            orders.preliminaryDefault = false;
          } else {
            orders.preliminaryDefault = true;
          }
        }

        // Transfers
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
          const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartner(
            preliminaryTurn.turnId,
            gameState.turnId,
            playerCountry.countryId
          );
          orders.techTransfer = techTransferOrders[0];

          const pendingBuildTransferOrders: TransferBuildOrder[] = await db.ordersRepo.getBuildTransferOrders(
            playerCountry.countryId,
            preliminaryTurn.turnId
          );
          orders.buildTransfers = pendingBuildTransferOrders;
        }

        // Adjustments
        if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
          // const preliminaryBuildLocs: BuildLoc[] = await db.ordersRepo.getAvailableBuildLocs(gameId, gameState.turnNumber, playerCountry.countryId);
          // const preliminaryAtRiskUnits: AtRiskUnit[] = await db.ordersRepo.getAtRiskUnits(gameState.gameId, gameState.turnNumber, playerCountry.countryId);
        }

        // Nominations
        if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
          // const preliminaryNominatableCountries: NominatableCountry[] = await db.ordersRepo.getNominatableCountries(gameState.gameId, gameState.turnNumber);
        }
      }
    }

    return orders;
  }

  async getOrderSets(gameId: number, countryId: number): Promise<OrderTurnIds> {
    const gameState: GameState = await db.gameRepo.getGameState(gameId);
    const countryOrderSets: CountryOrderSet[] = await db.ordersRepo.getCountryOrderSets(
      gameId,
      gameState.turnId,
      countryId
    );
    const pendingOrderSet: CountryOrderSet | undefined = countryOrderSets.find(
      (orderSet: CountryOrderSet) => orderSet.turnStatus === TurnStatus.PENDING
    );
    const preliminaryOrderSet: CountryOrderSet | undefined = countryOrderSets.find(
      (orderSet: CountryOrderSet) => orderSet.turnStatus === TurnStatus.PRELIMINARY
    );

    const turnIds: OrderTurnIds = {};

    if (pendingOrderSet) {
      // Standard Unit Movement
      if (
        [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(pendingOrderSet.turnType)
      ) {
        turnIds.units = pendingOrderSet.orderSetId;
      }

      // Retreating Unit Movement
      if (
        [TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingOrderSet.turnType) &&
        pendingOrderSet.inRetreat
      ) {
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

  async saveOrders(idToken: string, orders: TurnOrders): Promise<void> {
    // Identify user
    const accountService = new AccountService();

    const userId = await accountService.getUserIdFromToken(idToken);
    const userAssigned = await db.assignmentRepo.confirmUserIsCountry(orders.gameId, userId, orders.countryId);
    if (userAssigned) {
      const orderSetIds: OrderTurnIds = await this.getOrderSets(orders.gameId, orders.countryId);
      // orderSetIds.votes = 542;

      if (orderSetIds.votes && orders.votes) {
        db.ordersRepo.saveVotes(orderSetIds.votes, orders.votes.nominations);
      }

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

      if (orderSetIds.nomination && orders.nomination) {
        db.ordersRepo.saveNominationOrder(orderSetIds.nomination, orders.nomination.countryIds);
      }
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
            loc: [0, 0]
          });
        }

        if (disbandOrders.unitDisbandingDetailed.length < disbandOrders.unitsDisbanding.length) {
          disbandOrders.nukeBuildDetails.forEach((nuke: NukeBuildInDisband, index: number) => {
            if (nuke.nodeId === 0) {
              disbandOrders.unitDisbandingDetailed.unshift({
                unitId: index * -1,
                unitType: UnitType.NUKE,
                provinceName: nuke.province,
                loc: nuke.loc
              });
            }
          });
        }
      }
    }

    return disbandOrders;
  }

  async getNominationOrder(turnId: number, countryId: number): Promise<NominationOrder> {
    const countryDetails: NominatableCountry[] = await db.ordersRepo.getNominationOrder(turnId, countryId);
    const countryIds: number[] = countryDetails.map((country: NominatableCountry) => country.countryId);

    if (countryIds.length > 0) {
      return {
        countryDetails: countryDetails,
        countryIds: countryIds,
        coalitionSignature: `${countryDetails[0].rank}${countryDetails[1].rank}${countryDetails[2].rank}`.toUpperCase()
      };
    } else {
      return {
        countryDetails: [],
        countryIds: [0, 0, 0],
        coalitionSignature: '---'
      };
    }
  }
}
