import { Pool, QueryResult } from 'pg';
import { IDatabase, IMain } from 'pg-promise';
import { envCredentials } from '../../secrets/dbCredentials';
import {
  HistoricOrder,
  HistoricOrderResult,
  HistoricTurn,
  HistoricTurnResult
} from '../../models/objects/history-objects';
import { getHistoricUnitOrdersQuery } from '../queries/history/get-historic-unit-orders-query';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { getHistoricTurnQuery } from '../queries/history/get-historic-turn-query';
import { NominationRow } from '../../models/objects/database-objects';
import { CountryVotesResult } from '../../models/objects/option-context-objects';

export class HistoryRepository {
  pool = new Pool(envCredentials);
  constructor(private db: IDatabase<unknown>, private pgp: IMain) {}

  async getHistoricTurn(gameId: number, turnNumber: number): Promise<HistoricTurn | undefined> {
    const detailedTurns: HistoricTurn[] = await this.pool
      .query(getHistoricTurnQuery, [gameId, turnNumber])
      .then((result: QueryResult<HistoricTurnResult>) =>
        result.rows.map((turn: HistoricTurnResult) => {
          return <HistoricTurn>{
            gameId: turn.game_id,
            turnId: turn.turn_id,
            gameName: turn.game_name,
            turnName: turn.turn_name,
            turnNumber: turn.turn_number,
            turnType: turn.turn_type,
            turnStatus: turn.turn_status,
            yearNumber: turn.year_number,
            yearStylized: turn.year_stylized,
            deadline: turn.deadline,
            defaultsReady: turn.defaults_ready,
            hasCaptures: [TurnType.FALL_ORDERS, TurnType.FALL_RETREATS].includes(turn.turn_type),
            unitMovement: [
              TurnType.SPRING_ORDERS,
              TurnType.ORDERS_AND_VOTES,
              TurnType.SPRING_RETREATS,
              TurnType.FALL_ORDERS,
              TurnType.FALL_RETREATS
            ].includes(turn.turn_type),
            transfers: [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(turn.turn_type),
            adjustments: [TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(turn.turn_type),
            survivingCountries: turn.surviving_countries
          };
        })
      );

    return detailedTurns[0];
  }

  async getHistoricUnitOrders(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    countryId: number
  ): Promise<HistoricOrder[]> {
    const orders: HistoricOrder[] = await this.pool
      .query(getHistoricUnitOrdersQuery, [gameId, turnNumber, orderTurnId, countryId])
      .then((result: QueryResult<HistoricOrderResult>) =>
        result.rows.map(
          (orderResult: HistoricOrderResult) =>
            <HistoricOrder>{
              // Order Fields
              orderId: orderResult.order_id,
              orderSetId: orderResult.order_set_id,
              orderedUnitId: orderResult.ordered_unit_id,
              loc: orderResult.ordered_unit_loc,
              orderType: orderResult.order_type,
              secondaryUnitId: orderResult.secondary_unit_id,
              secondaryUnitLoc: orderResult.secondary_unit_loc,
              destinationId: orderResult.destination_id,
              eventLoc: orderResult.event_loc,
              orderStatus: orderResult.order_status,
              // Historic Fields
              countryId: orderResult.country_id,
              unitType: orderResult.unit_type,
              originProvinceName: orderResult.origin_province_name,
              destinationProvinceName: orderResult.destination_province_name,
              secondaryUnitType: orderResult.secondary_unit_type,
              secondaryProvinceName: orderResult.secondary_province_name,
              primaryResolution: orderResult.primary_resolution,
              secondaryResolution: orderResult.secondary_resolution,
              secondaryUnitOrderType: orderResult.secondary_unit_order_type
            }
        )
      );

    return orders;
  }

  async getNominationResults(turnId: number): Promise<NominationRow[]> {
    return await this.pool
      .query('SELECT * FROM nominations WHERE turn_id = $1', [turnId])
      .then((result: QueryResult) => result.rows);
  }

  async getVoteResults(turnId: number): Promise<CountryVotesResult[]> {
    return await this.pool
      .query('SELECT votes FROM order_sets WHERE turn_id = $1', [turnId])
      .then((result: QueryResult) => result.rows);
  }
}
