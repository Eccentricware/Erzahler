import { db } from '../../database/connection';
import { OrderDisplay } from '../../models/enumeration/order-display-enum';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { BuildType } from '../../models/enumeration/unit-enum';
import { GameStats } from '../../models/objects/database-objects';
import {
  HistoricCountryOrders,
  HistoricBuildOrders,
  HistoricNominatedCountry,
  HistoricNominationVote,
  HistoricOrder,
  HistoricOrderDisplay,
  HistoricTurn,
  HistoricYayVote,
  TurnHistory,
  HistoricCountry
} from '../../models/objects/history-objects';
import { Unit } from '../../models/objects/map-objects';
import { TransferTechOrder, TransferBuildOrder, Build, SingleTurnOrders } from '../../models/objects/order-objects';
import { terminalLog } from '../utils/general';
import { MapService } from './map-service';
import { OrdersService } from './orders-service';

export class HistoryService {
  async getGameStats(gameId: number): Promise<GameStats> {
    terminalLog(`Game Stats Requested: ${gameId}`);
    const gameState = await db.gameRepo.getGameState(gameId);
    const countryStats = await db.gameRepo.getGameStats(gameId, gameState.turnNumber);
    const turnHistory = await db.gameRepo.getTurnHistory(gameId);

    return {
      countries: countryStats,
      turns: turnHistory
    };
  }

  async getTurnHistory(gameId: number, turnNumber: number): Promise<TurnHistory> {
    const mapService = new MapService();
    const ordersService = new OrdersService();
    terminalLog(`Turn History Requested: (${gameId}-${turnNumber})`);

    const resultRender = await mapService.getMap(gameId, turnNumber);
    const startingRender = turnNumber > 0 ? await mapService.getMap(gameId, turnNumber - 1) : resultRender;

    const countryLibrary: Record<number, HistoricCountryOrders> = {};
    const historicTurn: HistoricTurn | undefined = await db.historyRepo.getHistoricTurn(gameId, turnNumber);

    if (!historicTurn) {
      terminalLog(`Turn History Not Found: ${gameId} - ${turnNumber}`);
      return <TurnHistory>{
        orderList: [],
        historicOrders: {
          turnStatus: TurnStatus.RESOLVED,
        },
        maps: {
          renderData: {
            start: startingRender,
            result: resultRender
          }
        }
      };
    }

    const historicOrders: SingleTurnOrders = {
      turnStatus: TurnStatus.RESOLVED
    };

    const turnHasUnitOrders = [
      TurnType.SPRING_ORDERS,
      TurnType.SPRING_RETREATS,
      TurnType.ORDERS_AND_VOTES,
      TurnType.FALL_ORDERS,
      TurnType.FALL_RETREATS
    ].includes(historicTurn.turnType);

    historicTurn.historicCountries.forEach((country) => {
      countryLibrary[country.countryId] = country;
      country.orders = {
        trades: {
          tech: undefined,
          builds: []
        },
        units: [],
        adjustments: [],
        buildsBanked: 0,
        buildsStartingNukes: 0,
        buildsIncreasingRange: 0,
        bankedBuildsIncreasingRange: 0
      };
    });

    if (turnHasUnitOrders) {
      const historicUnitOrders = await db.historyRepo.getHistoricUnitOrders(
        gameId,
        historicTurn.turnNumber > 0 ? historicTurn.turnNumber - 1 : 0,
        historicTurn.turnId,
        0
      );

      historicOrders.units = historicUnitOrders;

      historicUnitOrders.forEach((unitOrder: HistoricOrder) => {
        const orderDescription = this.setDescription(unitOrder);

        const historicOrderDisplay: HistoricOrderDisplay = {
          originProvince: unitOrder.originProvinceName,
          description: orderDescription,
          primaryResolution: unitOrder.primaryResolution,
          secondaryResolution: unitOrder.secondaryResolution,
          success: unitOrder.primaryResolution === 'Success',
          secondarySuccess: unitOrder.secondaryResolution === 'Success',
          orderType: unitOrder.orderType,
          loc: unitOrder.loc ? unitOrder.loc : [],
          eventLoc: unitOrder.eventLoc ? unitOrder.eventLoc : [],
          secondaryLoc: unitOrder.secondaryUnitLoc ? unitOrder.secondaryUnitLoc : []
        };
        const country = countryLibrary[unitOrder.countryId];
        country.orders.units.push(historicOrderDisplay);
      });
    }

    // Transfers
    if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(historicTurn.turnType)) {
      const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartners(
        gameId,
        historicTurn.turnNumber,
        historicTurn.turnId,
        0
      );

      techTransferOrders.forEach((transferOrder: TransferTechOrder) => {
        if (transferOrder.foreignCountryId) {
          const country = countryLibrary[transferOrder.countryId];
          country.orders.trades.tech = transferOrder.hasNukes
            ? `Offers nuke tech to ${transferOrder.foreignCountryName}`
            : `Requests nuke tech from ${transferOrder.foreignCountryName}`;
        }
      });

      const buildTransferOrders: TransferBuildOrder[] = await db.ordersRepo.getBuildTransferOrders(
        0,
        historicTurn.turnId
      );

      buildTransferOrders.forEach((transferOrder: TransferBuildOrder) => {
        const country = countryLibrary[transferOrder.countryId];
        country.orders.trades.builds.push({
          recipientName: transferOrder.recipientName,
          quantity: transferOrder.quantity
        });
      });
    }

    // Adjustments
    if (historicTurn.adjustments) {
      const buildOrders: HistoricBuildOrders[] = await db.historyRepo.getHistoricBuildOrders(
        historicTurn.gameId,
        historicTurn.turnNumber - 1,
        historicTurn.turnId,
        0
      );

      historicOrders.builds = {
        countryId: 0,
        countryName: 'History',
        bankedBuilds: 0,
        buildCount: 0,
        nukeRange: 0,
        increaseRange: 0,
        builds: [],
        nukesReady: []
      };

      const buildNodeIds: number[] = [];

      buildOrders.forEach((buildOrder: HistoricBuildOrders) => {
        historicOrders.builds?.builds.push(...buildOrder.builds)

        const country = countryLibrary[buildOrder.countryId];
        country.orders.buildsStartingNukes = buildOrder.increaseRange;

        buildOrder.builds.forEach((build: Build) => {
          if (build.buildType && build.nodeDisplay) {
            country.orders.adjustments.push({
              location: build.nodeDisplay ? build.nodeDisplay : '',
              loc: build.loc ? build.loc : [],
              description: `${
                build.buildType === BuildType.NUKE_RUSH
                  ? 'Rush '
                  : build.buildType === BuildType.NUKE_FINISH
                    ? 'Finish '
                    : 'Build '
                } ${
                  (build.buildType === BuildType.NUKE_RUSH || build.buildType === BuildType.NUKE_FINISH)
                  ? 'N'
                  : build.buildType[0].toUpperCase()
                } ${build.nodeDisplay}`
            });

            buildNodeIds.push(build.nodeId);

          } else if (build.buildType === BuildType.NUKE_START) {
            country.orders.buildsStartingNukes++;

          } else if (build.buildType === BuildType.RANGE) {
            country.orders.bankedBuildsIncreasingRange++;

          } else if (build.buildType === BuildType.BUILD) {
            country.orders.buildsBanked++;
          }
        });
      });

      const newUnitRenders = resultRender.units.filter((unit: Unit) => buildNodeIds.includes(unit.nodeId));
      startingRender.units.push(...newUnitRenders);

      const disbandOrders = await ordersService.prepareDisbandOrders(
        gameId,
        historicTurn.turnNumber > 0 ? historicTurn.turnNumber - 1 : 0,
        historicTurn.turnId,
        0
      );

      historicOrders.disbands = disbandOrders[0];

      disbandOrders.forEach((disbandOrder) => {
        const country = countryLibrary[disbandOrder.countryId];
        disbandOrder.unitDisbandingDetailed.forEach((disbandedUnit) => {
          country.orders.adjustments.push({
            location: disbandedUnit.provinceName,
            loc: disbandedUnit.loc,
            description: `Disband ${disbandedUnit.unitType[0].toUpperCase()} ${disbandedUnit.provinceName}`
          });
        });
      });
    }

    // Nominations
    let nominations;
    if ([TurnType.ADJ_AND_NOM, TurnType.NOMINATIONS].includes(historicTurn.turnType)) {
      nominations = await db.historyRepo.getNominationResults(historicTurn.gameId, historicTurn.turnNumber + 1);
      nominations.forEach((nomination) => {
        nomination.countries.sort((a: HistoricNominatedCountry, b: HistoricNominatedCountry) =>
          a.rank === b.rank
            ? (a.countryName < b.countryName ? -1 : 1)
            : a.rank < b.rank
              ? -1
              : 1
        );
      });
    }

    // Votes
    let votes;
    if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(historicTurn.turnType)) {
      votes = await db.historyRepo.getVoteResults(gameId, historicTurn.turnNumber);

      votes.forEach((vote: HistoricNominationVote) => {
        vote.countries.sort((a: HistoricNominatedCountry, b: HistoricNominatedCountry) =>
          a.rank === b.rank
            ? (a.countryName < b.countryName ? -1 : 1)
            : a.rank < b.rank
              ? -1
              : 1
        );

        vote.yayVotes.sort((a: HistoricYayVote, b: HistoricYayVote) => a.countryName < b.countryName ? -1 : 1);
      });
    }

    const orderList: HistoricCountryOrders[] = [];

    if (turnHasUnitOrders || historicTurn.adjustments) {
      for (const country in countryLibrary) {
        countryLibrary[country].orders.units.sort((a: HistoricOrderDisplay, b: HistoricOrderDisplay) => {
          return a.originProvince < b.originProvince ? -1 : 1;
        });
        orderList.push(countryLibrary[country]);
      }

      orderList.sort((a: HistoricCountryOrders, b: HistoricCountryOrders) => {
        return a.countryName < b.countryName ? -1 : 1;
      });
    }

    return <TurnHistory>{
      turnType: historicTurn.turnType,
      orderList: turnHasUnitOrders || historicTurn.adjustments ? orderList : undefined,
      nominations: nominations,
      votes: votes,
      historicOrders: historicOrders,
      maps: {
        renderData: {
          start: startingRender,
          result: resultRender
        }
      }
    };
  }

  setDescription(order: HistoricOrder): string {
    let description = `${order.unitType[0].toUpperCase()} ${order.originProvinceName} `;

    if ([OrderDisplay.HOLD, OrderDisplay.DISBAND, OrderDisplay.INVALID].includes(order.orderType)) {
      description += order.orderType;
    }

    if ([OrderDisplay.MOVE, OrderDisplay.MOVE_CONVOYED].includes(order.orderType)) {
      description += `=> ${order.destinationProvinceName}`;
    }

    if (order.orderType === OrderDisplay.SUPPORT && !order.destinationProvinceName) {
      description += `S ${order.secondaryUnitType[0].toUpperCase()} ${order.secondaryProvinceName}`;
    }

    if (
      [OrderDisplay.SUPPORT, OrderDisplay.CONVOY, OrderDisplay.AIRLIFT].includes(order.orderType) &&
      order.destinationProvinceName
    ) {
      description += `${order.orderType[0].toUpperCase()} ${order.secondaryUnitType[0].toUpperCase()} ${
        order.secondaryProvinceName
      } => ${order.destinationProvinceName}`;
    }

    if (order.orderType === OrderDisplay.NUKE) {
      description += `!!! ${order.destinationProvinceName}`;
    }

    return description;
  }
}
