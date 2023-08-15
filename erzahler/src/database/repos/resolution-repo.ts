import { Pool, QueryResult } from 'pg';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import { UnitType } from '../../models/enumeration/unit-enum';
import {
  AdjacentTransport,
  AdjacentTransportable,
  AdjacentTransportableResult,
  AdjacentTransportResult,
  TransportDestination,
  TransportDestinationResult
} from '../../models/objects/option-context-objects';
import {
  CountryTransferResources,
  TransferResourcesResults,
  TransportNetworkUnit,
  TransportNetworkUnitResult,
  UnitOrderResolution,
  UnitOrderResolutionResult
} from '../../models/objects/resolution/order-resolution-objects';
import { envCredentials } from '../../secrets/dbCredentials';
import { getTransferValidationDataQuery } from '../queries/resolution/get-transfer-validation-data-query';
import { getTransportNetworkValidation } from '../queries/resolution/get-transport-network-validation-query';
import { getUnitOrdersForResolutionQuery } from '../queries/resolution/get-unit-orders-for-resolution-query';
import { getRemainingGarrisonsQuery } from '../queries/resolution/get-remaining-garrisons-query';
import { OrderDisplay } from '../../models/enumeration/order-display-enum';
import {
  CountryHistoryRow,
  CountryStatCounts,
  CountryStatCountsResult,
  OrderRow,
  ProvinceHistoryRow,
  ProvinceHistoryRowResult,
  UnitHistoryRow
} from '../schema/table-fields';
import { getAbandonedBombardsQuery } from '../queries/resolution/get-abandoned-bombards-query';
import { updateOrderQuery } from '../queries/resolution/update-order-query';
import { updateOrderSetsQuery } from '../queries/resolution/resolve-order-sets-query';
import { resolveTurnQuery } from '../queries/resolution/resolve-turn-query';
import { getCountryUnitCityCountsQuery } from '../queries/resolution/get-country-unit-city-counts';
import { advancePreliminaryTurnQuery } from '../queries/resolution/advance-preliminary-turn-query';
import { terminalLog } from '../../server/utils/general';

export class ResolutionRepository {
  provinceHistoryCols: ColumnSet<unknown>;
  unitHistoryCols: ColumnSet<unknown>;
  countryHistoryCols: ColumnSet<unknown>;
  pool = new Pool(envCredentials);

  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.provinceHistoryCols = new pgp.helpers.ColumnSet(
      ['province_id', 'turn_id', 'controller_id', 'capital_owner_id', 'province_status', 'valid_retreat'],
      { table: 'province_histories' }
    );

    this.unitHistoryCols = new pgp.helpers.ColumnSet(['unit_id', 'turn_id', 'node_id', 'unit_status'], {
      table: 'unit_histories'
    });

    this.countryHistoryCols = new pgp.helpers.ColumnSet(
      [
        'country_id',
        'turn_id',
        'country_status',
        'city_count',
        'unit_count',
        'banked_builds',
        'nuke_range',
        'adjustments',
        'in_retreat',
        'vote_count',
        'nukes_in_production'
      ],
      { table: 'country_histories' }
    );
  }

  async updateOrders(orders: OrderRow[]): Promise<void> {
    orders.forEach(async (order: OrderRow) => {
      await this.pool
        .query(updateOrderQuery, [
          order.orderStatus,
          order.orderSuccess,
          order.power,
          order.valid,
          order.description,
          order.primaryResolution,
          order.secondaryResolution,
          order.orderId
        ])
        .catch((error: Error) => {
          terminalLog('Update Orders Error: ' + error.message);
        });
    });
  }

  async insertUnitHistories(unitHistories: UnitHistoryRow[], turnId: number): Promise<void> {
    const unitHistoryValues = unitHistories.map((unitHistory: UnitHistoryRow) => {
      return {
        unit_id: unitHistory.unitId,
        turn_id: turnId,
        node_id: unitHistory.nodeId,
        unit_status: unitHistory.unitStatus
      };
    });

    const query = this.pgp.helpers.insert(unitHistoryValues, this.unitHistoryCols);
    this.db.query(query).catch((error: Error) => {
      terminalLog('Insert Unit Histories Error: ' + error.message);
    });
  }

  async insertProvinceHistories(provinceHistories: ProvinceHistoryRow[], turnId: number): Promise<void> {
    const provinceHistoryValues = provinceHistories.map((provinceHistory: ProvinceHistoryRow) => {
      return {
        province_id: provinceHistory.provinceId,
        turn_id: turnId,
        controller_id: provinceHistory.controllerId,
        capital_owner_id: provinceHistory.capitalOwnerId,
        province_status: provinceHistory.provinceStatus,
        valid_retreat: provinceHistory.validRetreat
      };
    });

    const query = this.pgp.helpers.insert(provinceHistoryValues, this.provinceHistoryCols);
    this.db.query(query).catch((error: Error) => {
      terminalLog('Insert Province Histories Error: ' + error.message);
    });
  }

  async insertCountryHistories(countryHistories: Record<string, CountryHistoryRow>, turnId: number): Promise<void> {
    const countryHistoryValues = Object.values(countryHistories).map((countryHistory: CountryHistoryRow) => {
      return {
        country_id: countryHistory.countryId,
        turn_id: turnId,
        country_status: countryHistory.countryStatus,
        city_count: countryHistory.cityCount,
        unit_count: countryHistory.unitCount,
        banked_builds: countryHistory.bankedBuilds,
        nuke_range: countryHistory.nukeRange,
        adjustments: countryHistory.adjustments,
        in_retreat: countryHistory.inRetreat,
        vote_count: countryHistory.voteCount,
        nukes_in_production: countryHistory.nukesInProduction
      };
    });

    const query = this.pgp.helpers.insert(countryHistoryValues, this.countryHistoryCols);
    this.db.query(query).catch((error: Error) => {
      terminalLog('Insert Country Histories Error: ' + error.message);
    });
  }

  async restoreBombardedProvinces(abandonedBombards: ProvinceHistoryRow[], turnId: number): Promise<void> {
    const provinceHistoryValues = abandonedBombards.map((provinceHistory: ProvinceHistoryRow) => {
      return {
        province_id: provinceHistory.provinceId,
        turn_id: turnId,
        controller_id: provinceHistory.controllerId,
        capital_owner_id: provinceHistory.capitalOwnerId,
        province_status: provinceHistory.provinceStatus,
        valid_retreat: provinceHistory.validRetreat
      };
    });

    const query = this.pgp.helpers.insert(provinceHistoryValues, this.provinceHistoryCols);
    return this.db.query(query).catch((error: Error) => {
      terminalLog('Insert Province Histories Error: ' + error.message);
    });
  }

  // Legacy Queries

  /**
   *
   * @param currentTurnId
   * @param orderTurnId
   * @returns
   */
  async getUnitOrdersForResolution(
    gameId: number,
    turnNumber: number,
    orderTurnId: number
  ): Promise<UnitOrderResolution[]> {
    return await this.pool
      .query(getUnitOrdersForResolutionQuery, [gameId, turnNumber, orderTurnId])
      .then((result: QueryResult<any>) =>
        result.rows.map((order: UnitOrderResolutionResult) => {
          return <UnitOrderResolution>{
            orderId: order.order_id,
            orderSetId: order.order_set_id,
            orderType: order.order_type,
            orderSuccess: false,
            power: 1,
            supportCut: false,
            description: '',
            primaryResolution: '',
            secondaryResolution: '',
            valid: order.valid,
            supportSuccess: false,
            unit: {
              id: order.ordered_unit_id,
              type: order.unit_type,
              status: order.unit_status,
              countryId: order.country_id,
              countryName: order.country,
              canCapture: [UnitType.ARMY, UnitType.FLEET].includes(order.unit_type)
            },
            origin: {
              nodeId: order.node_id,
              provinceId: order.province_id,
              provinceName: order.province,
              provinceType: order.province_type,
              display: order.destination_display,
              voteType: order.vote_type,
              provinceStatus: order.province_status,
              controllerId: order.controller_id,
              capitalOwnerId: order.capital_owner_id,
              validRetreat: true
            },
            secondaryUnit: {
              id: order.secondary_unit_id,
              type: order.secondary_unit_type,
              countryId: order.secondary_country_id,
              country: order.secondary_country,
              provinceName: order.secondary_unit_province,
              orderType: order.secondary_unit_order_type,
              canCapture: [UnitType.ARMY, UnitType.FLEET].includes(order.secondary_unit_type)
            },
            destination: {
              nodeId: order.destination_id,
              provinceId: order.destination_province_id,
              provinceName: order.destination_province_name,
              provinceType: order.destination_province_type,
              display: order.destination_display,
              voteType: order.destination_vote_type,
              provinceStatus: order.destination_province_status,
              controllerId: order.destination_controller_id,
              capitalOwnerId: order.destination_capital_owner_id,
              validRetreat: true
            }
          };
        })
      )
      .catch((error: Error) => {
        terminalLog('Get Unit Orders For Resolution Error: ' + error.message);
        return [];
      });
  }

  /**
   * Returns potential transports, and destinations.
   * @param gameId     - number
   * @param turnNumber - number
   * @returns
   */
  async getTransportNetworkInfo(gameId: number, turnNumber: number): Promise<TransportNetworkUnit[]> {
    const unitAdjacencyInfoResult: TransportNetworkUnit[] = await this.pool
      .query(getTransportNetworkValidation, [gameId, turnNumber])
      .then((results: QueryResult<any>) => {
        return results.rows.map((result: TransportNetworkUnitResult) => {
          return <TransportNetworkUnit>{
            unitId: result.unit_id,
            transportables:
              result.adjacent_transportables &&
              result.adjacent_transportables.map((unit: AdjacentTransportResult) => {
                return <AdjacentTransportable>{
                  unitId: unit.unit_id,
                  unitName: unit.unit_name
                };
              }),
            transports:
              result.adjacent_transports &&
              result.adjacent_transports.map((unit: AdjacentTransportableResult) => {
                return <AdjacentTransport>{
                  unitId: unit.unit_id,
                  unitName: unit.unit_name
                };
              }),
            destinations:
              result.transport_destinations &&
              result.transport_destinations.map((destination: TransportDestinationResult) => {
                return <TransportDestination>{
                  nodeId: destination.node_id,
                  nodeName: destination.node_name,
                  provinceId: destination.province_id
                };
              })
          };
        });
      })
      .catch((error: Error) => {
        terminalLog('getTransportNetworkInfo: ' + error.message);
        return [];
      });

    return unitAdjacencyInfoResult;
  }

  async getTransferResourceValidation(gameId: number, turnNumber: number): Promise<CountryTransferResources[]> {
    return await this.pool.query(getTransferValidationDataQuery, [gameId, turnNumber]).then((result: QueryResult) =>
      result.rows.map((country: TransferResourcesResults) => {
        return <CountryTransferResources>{
          countryId: country.country_id,
          countryName: country.country_name,
          bankedBuilds: country.banked_builds,
          buildsRemaining: country.banked_builds,
          nukeRange: country.nuke_range
        };
      })
    );
  }

  async getRemainingGarrisons(gameId: number, turnNumber: number): Promise<UnitOrderResolution[]> {
    return await this.pool.query(getRemainingGarrisonsQuery, [gameId, turnNumber]).then((result: QueryResult) =>
      result.rows.map((garrison: UnitOrderResolutionResult) => {
        return <UnitOrderResolution>{
          orderId: 0,
          orderSetId: 0,
          orderType: OrderDisplay.HOLD,
          orderSuccess: false,
          power: 1,
          supportCut: false,
          description: '',
          primaryResolution: '',
          secondaryResolution: '',
          valid: true,
          supportSuccess: false,
          unit: {
            id: garrison.ordered_unit_id,
            type: UnitType.GARRISON,
            status: garrison.unit_status,
            countryId: garrison.country_id,
            countryName: garrison.country,
            canCapture: false
          },
          origin: {
            nodeId: garrison.node_id,
            provinceId: garrison.province_id,
            provinceName: garrison.province,
            provinceType: garrison.province_type,
            display: garrison.destination_province_name,
            voteType: garrison.vote_type,
            provinceStatus: garrison.province_status,
            controllerId: garrison.controller_id,
            capitalOwnerId: garrison.capital_owner_id,
            validRetreat: true
          },
          secondaryUnit: {
            id: garrison.secondary_unit_id,
            type: garrison.secondary_unit_type,
            countryId: garrison.secondary_country_id,
            country: garrison.secondary_country,
            provinceName: garrison.secondary_unit_province,
            orderType: OrderDisplay.HOLD,
            canCapture: false
          },
          destination: {
            nodeId: garrison.destination_id,
            provinceId: garrison.destination_province_id,
            provinceName: garrison.destination_province_name,
            provinceType: garrison.destination_province_type,
            display: garrison.destination_province_name,
            voteType: garrison.destination_vote_type,
            provinceStatus: garrison.destination_province_status,
            controllerId: garrison.destination_controller_id,
            capitalOwnerId: garrison.destination_capital_owner_id,
            validRetreat: true
          }
        };
      })
    );
  }

  async getAbandonedBombards(gameId: number, turnNumber: number): Promise<ProvinceHistoryRow[]> {
    return await this.pool.query(getAbandonedBombardsQuery, [gameId, turnNumber]).then((result: QueryResult) =>
      result.rows.map((province: ProvinceHistoryRowResult) => {
        return <ProvinceHistoryRow>{};
      })
    );
  }

  async updateOrderSets(orderSets: any[], turnId: number): Promise<void> {
    orderSets.forEach(async (orderSet: any) => {
      await this.pool.query(updateOrderSetsQuery, [turnId]);
    });
  }

  async resolveTurn(turnId: number): Promise<void> {
    await this.pool.query(resolveTurnQuery, [turnId]);
  }

  async advancePreliminaryTurn(turnId: number): Promise<void> {
    await this.pool.query(advancePreliminaryTurnQuery, [turnId]);
  }

  async getCountryStatCounts(gameId: number, turnNumber: number): Promise<CountryStatCounts[]> {
    return await this.pool.query(getCountryUnitCityCountsQuery, [gameId, turnNumber]).then((result: QueryResult) =>
      result.rows.map((country: CountryStatCountsResult) => {
        return <CountryStatCounts>{
          countryId: country.country_id,
          cityCount: Number(country.city_count),
          unitCount: Number(country.unit_count)
        };
      })
    );
  }
}
