import { db } from "../../database/connection";
import { OrderDisplay } from "../../models/enumeration/order-display-enum";
import { TurnType } from "../../models/enumeration/turn-type-enum";
import { GameStats } from "../../models/objects/database-objects";
import { CountryOrders, HistoricOrder, HistoricOrderDisplay, HistoricTurn, TurnHistory } from "../../models/objects/history-objects";
import { TransferTechOrder, TransferBuildOrder, BuildOrders } from "../../models/objects/order-objects";
import { terminalLog } from "../utils/general";
import { MapService } from "./map-service";
import { OrdersService } from "./orders-service";

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
    const startingRender = turnNumber > 0
      ? await mapService.getMap(gameId, turnNumber - 1)
      : resultRender;

    const countryLibrary: Record<number, CountryOrders> = {};
    const historicTurn: HistoricTurn | undefined = await db.historyRepo.getHistoricTurn(gameId, turnNumber);

    if (!historicTurn) {
      terminalLog(`Turn History Not Found: ${gameId} - ${turnNumber}`);
      return <TurnHistory>{
        orderList: [],
        maps: {
          orders: {
            nuclear: [],
            standard: []
          },
          renderData: {
            start: startingRender,
            result: resultRender
          }
        }
      };
    }

    historicTurn.survivingCountries.forEach((country: any) => {
      countryLibrary[country.countryId] = country;
      country.orders = {
        trades: {
          tech: undefined,
          builds: []
        },
        units: [],
        adjustments: []
      };
    });

    if ([
      TurnType.SPRING_ORDERS,
      TurnType.SPRING_RETREATS,
      TurnType.ORDERS_AND_VOTES,
      TurnType.FALL_ORDERS,
      TurnType.FALL_RETREATS
    ].includes(historicTurn.turnType)) {
      const historicUnitOrders = await db.historyRepo.getHistoricUnitOrders(
        gameId,
        historicTurn.turnNumber > 0 ? historicTurn.turnNumber - 1 : 0,
        historicTurn.turnId,
        0
      );

      historicUnitOrders.forEach((unitOrder: HistoricOrder) => {
        const orderDescription = this.setDescription(unitOrder);

        const historicOrderDisplay: HistoricOrderDisplay = {
          originProvince: unitOrder.originProvinceName,
          description: orderDescription,
          primaryResolution: unitOrder.primaryResolution,
          secondaryResolution: unitOrder.secondaryResolution,
          success: unitOrder.primaryResolution === 'Success',
          secondarySuccess: unitOrder.secondaryResolution === 'Success'
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
        const country = countryLibrary[transferOrder.countryId];
        country.orders.trades.tech = transferOrder.hasNukes
          ? `Offers nuke tech to ${transferOrder.foreignCountryName}`
          : `Requests nuke tech from ${transferOrder.foreignCountryName}`;
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
    if ([TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(historicTurn.turnType)) {
      const buildOrders: BuildOrders[] = await db.ordersRepo.getBuildOrders(
        historicTurn.gameId,
        historicTurn.turnNumber,
        historicTurn.turnId,
        0
      );

      buildOrders.forEach((buildOrder: BuildOrders) => {
        buildOrder.builds.forEach((build: any) => {
          if (build.buildType) {
            const country = countryLibrary[buildOrder.countryId];
            country.orders.adjustments.push({
              location: build.nodeDisplay,
              description: `Build ${build.buildType[0].toUpperCase()} ${build.nodeDisplay}`
            });
          }
        });
      });

      const disbandOrders = await ordersService.prepareDisbandOrders(
        gameId,
        historicTurn.turnNumber > 0 ? historicTurn.turnNumber - 1 : 0,
        historicTurn.turnId,
        0
      );

      disbandOrders.forEach((disbandOrder: any) => {
        const country = countryLibrary[disbandOrder.countryId];
        disbandOrder.unitDisbandingDetailed.forEach((disbandedUnit: any) => {
          country.orders.adjustments.push({
            location: disbandedUnit.provinceName,
            description: `Disband ${disbandedUnit.unitType[0].toUpperCase()} ${disbandedUnit.provinceName}`
          });
        });
      });
    }

    // Votes
    if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(historicTurn.turnType)) {
      const votes = await db.ordersRepo.getVotes(historicTurn.turnId, 0);
    }

    const orderList: CountryOrders[] = [];

    for (const country in countryLibrary) {
      countryLibrary[country].orders.units.sort((a: HistoricOrderDisplay, b: HistoricOrderDisplay) => {
        return a.originProvince < b.originProvince ? -1 : 1;
      });
      orderList.push(countryLibrary[country]);
    }

    orderList.sort((a: CountryOrders, b: CountryOrders) => {
      return a.countryName < b.countryName ? -1 : 1;
    });

    return <TurnHistory> {
      orderList: orderList,
      maps: {
        orders: {
          nuclear: [],
          standard: []
        },
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

    if ([OrderDisplay.SUPPORT, OrderDisplay.CONVOY, OrderDisplay.AIRLIFT].includes(order.orderType) && order.destinationProvinceName) {
      description += `${order.orderType[0].toUpperCase()} ${order.secondaryUnitType[0].toUpperCase()} ${order.secondaryProvinceName} => ${order.destinationProvinceName}`;
    }

    if (order.orderType === OrderDisplay.NUKE) {
      description += `! ${order.destinationProvinceName}`;
    }

    return description;
  }
}
