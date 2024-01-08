import { db } from "../../database/connection";
import { TurnType } from "../../models/enumeration/turn-type-enum";
import { GameStats } from "../../models/objects/database-objects";
import { HistoricTurn, TurnHistory } from "../../models/objects/history-objects";
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
    terminalLog(`Turn History Requested: ${gameId} - ${turnNumber}`);

    const resultRender = await mapService.getMap(gameId, turnNumber);
    const startingRender = turnNumber > 0
      ? await mapService.getMap(gameId, turnNumber - 1)
      : resultRender;

    const countryLibrary: Record<number, any> = {};
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
          tech: country.techPartnerName ? `${country.countryName} ${country.nukeRange ? 'offers nuke tech to' : 'requests nuke tech from'} ${country.techPartnerName}` : undefined,
          builds: []
        },
        units: [],
        builds: [],
        disbands: []
      };
    });

    if ([
      TurnType.SPRING_ORDERS,
      TurnType.SPRING_RETREATS,
      TurnType.ORDERS_AND_VOTES,
      TurnType.FALL_ORDERS,
      TurnType.FALL_RETREATS
    ].includes(historicTurn.turnType)) {
      const unitOrdersDescriptions = await db.historyRepo.getHistoricUnitOrders(
        gameId,
        historicTurn.turnNumber,
        historicTurn.turnId,
        0
      );

      unitOrdersDescriptions.forEach((unitOrder: any) => {
        const country = countryLibrary[unitOrder.countryId];
        country.orders.units.push(unitOrder);
      });
    }

    // Transfers
    if ([TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(historicTurn.turnType)) {
      // const techTransferOrders: TransferTechOrder[] = await db.ordersRepo.getTechTransferPartners(
      //   gameId,
      //   historicTurn.turnNumber,
      //   historicTurn.turnId,
      //   0
      // );

      // console.log(techTransferOrders);

      const buildTransferOrders: TransferBuildOrder[] = await db.ordersRepo.getBuildTransferOrders(
        0,
        historicTurn.turnId
      );

      buildTransferOrders.forEach((transferOrder: TransferBuildOrder) => {
        const country = countryLibrary[transferOrder.countryId];
        country.orders.trades.builds.push(transferOrder);
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
        const country = countryLibrary[buildOrder.countryId];
        country.orders.builds.push(buildOrder);
      });

      const disbandOrders = await ordersService.prepareDisbandOrders(
        gameId,
        historicTurn.turnId,
        historicTurn.turnId,
        0
      );

      // disbandOrders.forEach((disbandOrder: any) => {
      //   const country = countryLibrary[disbandOrder.countryId];
      //   country.orders.disbands.push(disbandOrder);
      // });
    }

    // Votes
    if ([TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(historicTurn.turnType)) {
      const votes = await db.ordersRepo.getVotes(historicTurn.turnId, 0);
    }

    const orderList = [];

    for (let country in countryLibrary) {
      orderList.push(countryLibrary[country]);
    }

    return <TurnHistory>{
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
}
