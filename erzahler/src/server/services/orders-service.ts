import { GameState } from '../../models/objects/last-turn-info-object';
import { AtRiskUnit, BuildLocProvince, NominatableCountry, Order } from '../../models/objects/option-context-objects';
import { BuildType, UnitType } from '../../models/enumeration/unit-enum';
import { db } from '../../database/connection';
import { AccountService } from './account-service';
import { UpcomingTurn } from '../../models/objects/scheduler/upcoming-turns-object';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { UserAssignment } from '../../models/objects/assignment-objects';
import { AssignmentType } from '../../models/enumeration/assignment-type-enum';
import { CountryState } from '../../models/objects/games/country-state-objects';
import {
  Build,
  BuildOrders,
  DisbandOrders,
  DisbandingUnitDetail,
  NominationOrder,
  NukeBuildInDisband,
  TransferBuildOrder,
  TransferTechOrder,
  TurnOrders
} from '../../models/objects/order-objects';
import { CountryOrderSet, CountryOrderSetIds, OrderTurnIds } from '../../models/objects/orders/expected-order-types-object';
import { terminalAddendum, terminalLog } from '../utils/general';
import { NominationRow, Turn } from '../../models/objects/database-objects';
import { OptionsService } from './options-service';
import { CountryStats } from '../../models/objects/games/country-stats-objects';

export class OrdersService {
  optionsService = new OptionsService();

  async getTurnOrders(idToken: string, gameId: number): Promise<TurnOrders | undefined> {
    // Identify user
    const accountService = new AccountService();

    const user = await accountService.getUserProfile(idToken);
    if (!user) {
      return;
    }

    const userId = user.userId;
    const gameState = await db.gameRepo.getGameState(gameId);
    if (!gameState) {
      terminalLog(`${user.username} (${userId}) attempted to get orders for invalid game (${gameId})`);
      return;
    }
    // Identify Player Type (Player, Admin, Spectator)

    terminalLog(`Current orders requested for ${gameState.gameName} (${gameId}) by ${user.username} (${userId})`);
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
          assignment.username === 'Erzahler')
      );
    });

    const playerVision = playerCountries.length > 0;
    const adminVision = adminAssignments.length > 0;

    const orders: TurnOrders = {
      gameId: gameId,
      userId: userId,
      countryId: 0
    };

    if (playerVision) {
      orders.role === 'player';
      const countryStates = await db.gameRepo.getCountryState(
        gameId,
        gameState.turnNumber,
        playerCountries[0].countryId
      );
      const playerCountry: CountryState = countryStates[0];
      orders.countryId = playerCountry.countryId;
      orders.nukeRange = playerCountry.nukeRange;

      let pendingTurn: UpcomingTurn | undefined = undefined;
      let preliminaryTurn: UpcomingTurn | undefined = undefined;

      const upcomingTurns: UpcomingTurn[] = await db.schedulerRepo.getUpcomingTurns(gameId);
      const playerOrderSets: CountryOrderSetIds = await db.ordersRepo.getCountryOrderSetIds(playerCountry.countryId);

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
        terminalAddendum('WARNING', `GameId ${gameId} has too many upcoming turns! (${upcomingTurns.length})`);
      }

      if (pendingTurn) {
        orders.pending = {
          turnStatus: TurnStatus.PENDING,
          orderSetId: playerOrderSets.pendingOrderSetId
        };
        // Standard Unit Movement
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(pendingTurn.turnType)) {
          orders.pending.units = await db.ordersRepo.getTurnUnitOrders(
            gameId,
            gameState.turnNumber,
            pendingTurn.turnId,
            playerCountry.countryId
          );

          if (orders.pending.units.length > 0 && orders.pending.units[0].orderStatus !== 'Default') {
            orders.pending.default = false;

          } else {
            orders.pending.default = true;
          }
        }

        // Retreating Unit Movement
        if ([TurnType.SPRING_RETREATS, TurnType.FALL_RETREATS].includes(pendingTurn.turnType)) {
          if (playerCountry.retreating) {
            orders.pending.units = await db.ordersRepo.getTurnUnitOrders(
              gameId,
              gameState.turnNumber,
              pendingTurn.turnId,
              playerCountry.countryId
            );
            if (orders.pending.units.length > 0 && orders.pending.units[0].orderStatus !== 'Default') {
              orders.pending.default = false;
            } else {
              orders.pending.default = true;
            }
          }
        }

        // Transfers
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
          const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartners(
            gameId,
            gameState.turnNumber,
            pendingTurn.turnId,
            playerCountry.countryId
          );
          orders.pending.techTransfer = techTransferOrders[0]
            ? techTransferOrders[0]
            : {
                orderSetId: orders.pending.orderSetId,
                countryId: playerCountry.countryId,
                countryName: playerCountry.name,
                hasNukes: playerCountry.nukeRange,
                foreignCountryId: 0,
                foreignCountryName: '---',
                description: '',
                resolution: '',
                success: false
              };

          const pendingBuildTransferOrders: TransferBuildOrder[] = await db.ordersRepo.getBuildTransferOrders(
            playerCountry.countryId,
            pendingTurn.turnId
          );
          orders.pending.buildTransfers = pendingBuildTransferOrders;
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
            const nullBuilds = pendingBuildOrders[0].builds[0].buildNumber === null;
            if (nullBuilds) {
              pendingBuildOrders[0].builds = [];
            }

            orders.pending.builds = pendingBuildOrders[0]
              ? pendingBuildOrders[0]
              : {
                  countryId: playerCountry.countryId,
                  countryName: playerCountry.name,
                  bankedBuilds: 0,
                  buildCount: 0,
                  nukeRange: playerCountry.nukeRange,
                  increaseRange: 0,
                  builds: [],
                  nukesReady: []
                };
          } else {
            orders.pending.disbands = await this.prepareDisbandOrders(
              gameId,
              gameState.turnId,
              pendingTurn.turnId,
              playerCountry.countryId
            );
          }
        }

        // Nominations
        if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
          orders.pending.nomination = await this.getNominationOrder(
            pendingTurn.gameId,
            pendingTurn.turnNumber,
            pendingTurn.turnId,
            playerCountry.countryId
          );
        }

        // Votes
        if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
          orders.pending.votes = await db.ordersRepo.getVotes(pendingTurn.turnId, playerCountry.countryId);
        }
      }

      if (preliminaryTurn) {
        orders.preliminary = {
          turnStatus: TurnStatus.PRELIMINARY,
          orderSetId: playerOrderSets.preliminaryOrderSetId
        };
        // Units
        if (
          [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES, TurnType.FALL_ORDERS].includes(preliminaryTurn.turnType)
        ) {
          orders.preliminary.units = await db.ordersRepo.getTurnUnitOrders(
            gameId,
            gameState.turnNumber,
            preliminaryTurn.turnId,
            playerCountry.countryId
          );
          if (orders.preliminary.units.length > 0 && orders.preliminary.units[0].orderStatus !== 'Default') {
            orders.preliminary.default = false;
          } else {
            orders.preliminary.default = true;
          }
        }

        // Transfers
        if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
          const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartners(
            gameId,
            gameState.turnNumber,
            preliminaryTurn.turnId,
            playerCountry.countryId
          );
          orders.preliminary.techTransfer = techTransferOrders[0]
            ? techTransferOrders[0]
            : {
                orderSetId: orders.preliminary.orderSetId,
                countryId: playerCountry.countryId,
                countryName: playerCountry.name,
                hasNukes: playerCountry.nukeRange,
                foreignCountryId: 0,
                foreignCountryName: '---',
                description: '',
                resolution: '',
                success: false
              };

          const pendingBuildTransferOrders: TransferBuildOrder[] = await db.ordersRepo.getBuildTransferOrders(
            playerCountry.countryId,
            preliminaryTurn.turnId
          );
          orders.preliminary.buildTransfers = pendingBuildTransferOrders;
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
            orders.preliminary.builds = pendingBuildOrders[0];
          } else {
            orders.preliminary.disbands = await this.prepareDisbandOrders(
              gameId,
              gameState.turnId,
              preliminaryTurn.turnId,
              playerCountry.countryId
            );
          }
        }

        // Nominations
        if ([TurnType.NOMINATIONS, TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
          orders.preliminary.nomination = await this.getNominationOrder(
            preliminaryTurn.gameId,
            preliminaryTurn.turnNumber,
            preliminaryTurn.turnId,
            playerCountry.countryId
          );
        }
      }
    } else if (adminVision) {

    }

    return orders;
  }

  async getOrderSets(gameId: number, countryId: number): Promise<OrderTurnIds> {
    const gameState: GameState = await db.gameRepo.getGameState(gameId);
    const countryOrderSets: CountryOrderSet[] = await db.ordersRepo.getCountryOrderSets(
      gameId,
      gameState.turnNumber,
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
      turnIds.core = pendingOrderSet.orderSetId;
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
      turnIds.core = preliminaryOrderSet.orderSetId;
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
    if (!userId) {
      terminalAddendum('Warning', `Attempt to save orders with invalid token (${idToken})`);
      return;
    }

    if (!orders.countryId) {
      terminalAddendum('Warning', `User ${userId} attempted to submit orders without countryId`);
      return;
    }
    const userAssigned = await db.assignmentRepo.confirmUserIsCountry(orders.gameId, userId, orders.countryId);

    if (userAssigned) {
      terminalLog(`Saving Orders: Game ${orders.gameId} | Country ${orders.countryId} | User ${userId}`);
      terminalAddendum(`Orders`, `${JSON.stringify(orders)}`);
      // const orderSetIds: OrderTurnIds = await this.getOrderSets(orders.gameId, orders.countryId);
      // let orderSetUpdated = false;

      // Units
      // Spring Orders | Spring Orders and Votes | Spring Retreats | Fall Orders | Fall Retreats
      if (orders.pending && orders.pending.units) {
        orders.pending.units.forEach(async (unitOrder: Order) => {
          await db.ordersRepo.saveUnitOrder(unitOrder);
        });
      }

      // Spring Orders | Spring Orders and Votes | Fall Orders
      if (orders.preliminary && orders.preliminary.units) {
        orders.preliminary.units.forEach(async (unitOrder: Order) => {
          await db.ordersRepo.saveUnitOrder(unitOrder);
        });
      }

      // Transfers
      // Spring Orders | Spring Orders and Votes
      if (orders.pending && orders.pending.techTransfer) {
        await db.ordersRepo.saveTechTransfer(orders.pending.techTransfer);
      }

      // Spring Orders | Spring Orders and Votes
      if (orders.preliminary && orders.preliminary.techTransfer) {
        await db.ordersRepo.saveTechTransfer(orders.preliminary.techTransfer);
      }

      if (orders.pending?.buildTransfers && orders.pending?.buildTransfers.length > 0 && orders.pending.orderSetId) {
        await db.ordersRepo.saveBuildTransfers(orders.pending.orderSetId, orders.pending.buildTransfers);
      }

      if (orders.preliminary?.buildTransfers && orders.preliminary.buildTransfers.length > 0 && orders.preliminary.orderSetId) {
        await db.ordersRepo.saveBuildTransfers(orders.preliminary.orderSetId, orders.preliminary.buildTransfers);
      }

      // Adjustments
      // Adjustments | Adjustments and Nominations
      if (orders.pending?.builds && orders.pending.builds.builds.length > 0 && orders.pending.orderSetId) {
        await this.saveBuildOrders(orders.pending.orderSetId, orders.pending.builds);
      }

      if (orders.preliminary?.builds && orders.preliminary.builds.builds.length > 0 && orders.preliminary.orderSetId) {
        await this.saveBuildOrders(orders.preliminary.orderSetId, orders.preliminary.builds);
      }

      if (orders.pending && orders.pending.disbands && orders.pending.orderSetId) {
        await db.ordersRepo.saveDisbandOrders(orders.pending.orderSetId, orders.pending.disbands);
      }

      if (orders.preliminary && orders.preliminary.disbands && orders.preliminary.orderSetId) {
        await db.ordersRepo.saveDisbandOrders(orders.preliminary.orderSetId, orders.preliminary.disbands);
      }

      // Nominations
      // Nominations | Adjustments and Nominations
      if (orders.pending && orders.pending.nomination && orders.pending.orderSetId) {
        await db.ordersRepo.saveNominationOrder(orders.pending.orderSetId, orders.pending.nomination.countryIds);
      }


      // Votes
      // Votes | Orders and Votes
      if (orders.pending && orders.pending.votes && orders.pending.orderSetId) {
        await db.ordersRepo.saveVotes(orders.pending.orderSetId, orders.pending.votes);
      }

      // if (!orderSetUpdated && orderSetIds.core) {
      //   db.ordersRepo.updateOrderSetSubmissionTime(orderSetIds.core);
      // }
    } else {
      terminalAddendum('ALERT', `Unassigned user (${userId}) attempted to save orders for Game ${orders.gameId} | Country ${orders.countryId}`)
    }
  }

  async createAdjustmentDefaults(upcomingTurn: Turn, retreatingCountryIds?: number[]): Promise<void> {
    if (!upcomingTurn.turnId) {
      terminalAddendum('Warning', `Attempt to create adjustment defaults for turn without turnId`);
      return;
    }

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

    const newOrderSetLibrary: Record<number, number> = {};
    newOrderSets.forEach((orderSet: any) => {
      newOrderSetLibrary[orderSet.countryId] = orderSet.orderSetId;
    });

    const countryStats: CountryStats[] =
      await db.gameRepo.getGameStats(upcomingTurn.gameId, upcomingTurn.turnNumber);

    const buildOptions: BuildLocProvince[] =
      await db.optionsRepo.getAvailableBuildLocs(upcomingTurn.turnNumber, upcomingTurn.gameId, 0);

    const disbandOptions: AtRiskUnit[] =
      await db.optionsRepo.getAtRiskUnits(upcomingTurn.gameId, upcomingTurn.turnNumber, 0);

    const allBuilds: Build[] = [];

    countryStats.forEach((country: CountryStats) => {
      if (!newOrderSetLibrary[country.id]) {
        return;
      }

      if (country.adjustments > 0) {
        const countryBuildOptions = buildOptions.filter((buildOption: BuildLocProvince) =>
          buildOption.countryId === country.id
        );

        const countryDefaultBuilds: Build[] = []
        let currentOptionIndex = 0;
        while (countryDefaultBuilds.length < country.adjustments) {
          countryDefaultBuilds.push({
            orderSetId: newOrderSetLibrary[country.id],
            buildNumber: countryDefaultBuilds.length + 1,
            buildType: BuildType.ARMY,
            nodeId: countryBuildOptions[currentOptionIndex].landNodeId,
            typeId: 1
          });
          currentOptionIndex++;
        }

        allBuilds.push(...countryDefaultBuilds);
      }

      if (country.adjustments < 0) {
        const countryAtRiskUnits = disbandOptions.filter((atRiskUnit: AtRiskUnit) =>
          atRiskUnit.countryId === country.id
        );

        const countryDisbands: DisbandingUnitDetail[] = [];
        let disbandedIndex = 0;

        while (countryDisbands.length < Math.abs(country.adjustments)) {
          countryDisbands.push({
            unitId: countryAtRiskUnits[disbandedIndex].unitId,
            unitType: countryAtRiskUnits[disbandedIndex].unitType,
            provinceName: countryAtRiskUnits[disbandedIndex].provinceName,
            loc: countryAtRiskUnits[disbandedIndex].loc
          });

          disbandedIndex++;
        }

        // newOrderSets[newOrderSetLibrary[country.id]].disbands = countryDisbands;
        db.ordersRepo.saveDisbandOrders(newOrderSetLibrary[country.id], {
          countryId: country.id,
          countryName: country.name,
          bankedBuilds: 0,
          disbands: Math.abs(country.adjustments),
          unitDisbandingDetailed: countryDisbands,
          nukeRange: country.nuke,
          increaseRange: 0,
          unitsDisbanding: countryDisbands.map((disband: DisbandingUnitDetail) => disband.unitId)
        });
      }
    });

    if (allBuilds.length > 0) {
      allBuilds.forEach(async (build: Build) => {
        await db.ordersRepo.saveDefaultBuildOrder(build);
      });
    }
  }

  async saveBuildOrders(orderSetId: number, buildOrders: BuildOrders): Promise<void> {
    await db.ordersRepo.updateBuildOrderSet(orderSetId, buildOrders.increaseRange);

    if (buildOrders.builds.length > 0) {
      buildOrders.builds.forEach(async (build: Build, index: number) => {
        await db.ordersRepo.saveBuildOrder(orderSetId, build, index + 1);
      });
    }
  }

  async prepareDisbandOrders(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    countryId: number
  ): Promise<DisbandOrders> {
    const disbandOrders: DisbandOrders = await db.ordersRepo.getDisbandOrders(
      gameId,
      turnNumber,
      orderTurnId,
      countryId
    );

    // if (disbandOrders.nukeLocs.length > 0) {
    //   disbandOrders.nukeBuildDetails = await db.ordersRepo.getNukesReadyLocs(orderTurnId, countryId);

    //   if (disbandOrders.nukeBuildDetails && disbandOrders.nukeBuildDetails.length < disbandOrders.nukeLocs.length) {
    //     while (disbandOrders.nukeBuildDetails.length < disbandOrders.nukeLocs.length) {
    //       disbandOrders.nukeBuildDetails.unshift({
    //         unitId: disbandOrders.nukeBuildDetails.length * -1,
    //         nodeId: 0,
    //         province: '---',
    //         display: '---',
    //         loc: [0, 0]
    //       });
    //     }

    //     if (disbandOrders.unitDisbandingDetailed.length < disbandOrders.unitsDisbanding.length) {
    //       disbandOrders.nukeBuildDetails.forEach((nuke: NukeBuildInDisband, index: number) => {
    //         if (nuke.nodeId === 0) {
    //           disbandOrders.unitDisbandingDetailed.unshift({
    //             unitId: index * -1,
    //             unitType: UnitType.NUKE,
    //             provinceName: nuke.province,
    //             loc: nuke.loc
    //           });
    //         }
    //       });
    //     }
    //   }
    // }

    return disbandOrders;
  }

  async getNominationOrder(gameId: number, turnNumber: number, turnId: number, countryId: number): Promise<NominationOrder> {
    const countryDetails: NominatableCountry[] = await db.ordersRepo.getNominationOrder(gameId, turnNumber, turnId, countryId);
    const countryIds: number[] = countryDetails.map((country: NominatableCountry) => country.countryId);

    if (countryIds.length > 0 && countryIds[0] !== null) {
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

  // setDescription(order: UnitOrderResolution): string {
  //   let description = `${order.unit.type[0].toUpperCase()} ${order.origin.provinceName} `;

  //   if ([OrderDisplay.HOLD, OrderDisplay.DISBAND, OrderDisplay.INVALID].includes(order.orderType)) {
  //     description += order.orderType;
  //   }

  //   if ([OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(order.orderType)) {
  //     description += `=> ${order.destination.display}`;
  //   }

  //   if (order.orderType === OrderDisplay.SUPPORT && ![OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(order.secondaryUnit.orderType)) {
  //     description += `S ${order.secondaryUnit.type[0].toUpperCase()} ${order.secondaryUnit.provinceName}`;
  //   }

  //   if ([OrderDisplay.SUPPORT, OrderDisplay.CONVOY, OrderDisplay.AIRLIFT].includes(order.orderType) && [OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(order.secondaryUnit.orderType)) {
  //     description += `${order.orderType[0].toUpperCase()} ${order.secondaryUnit.type[0].toUpperCase()} ${order.secondaryUnit.provinceName} => ${order.destination.display}`;
  //   }

  //   if (order.orderType === OrderDisplay.NUKE) {
  //     description += `! ${order.destination.display}`;
  //   }

  //   return description;
  // }
}
