import { Pool, QueryResult } from 'pg';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import { UnitType } from '../../models/enumeration/unit-enum';
import {
  AdjacentTransport,
  AdjacentTransportable,
  AdjacentTransportableResult,
  AdjacentTransportResult,
  Nomination,
  TransportDestination,
  TransportDestinationResult
} from '../../models/objects/option-context-objects';
import {
  AdjResolutionData,
  AdjResolutionDataResult,
  AvailableProvince,
  AvailableProvinceResult,
  BuildDetails,
  BuildDetailsResult,
  CountryTransferResources,
  DisbandDetails,
  DisbandDetailsResult,
  TransferResourcesResults,
  TransportNetworkUnit,
  TransportNetworkUnitResult,
  UnitAndCountryIds,
  UnitAndCountryIdsResult,
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
  InitialUnit,
  OrderAdjustmentRow,
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
import { terminalAddendum, terminalLog } from '../../server/utils/general';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { updateTurnProgressQuery } from '../queries/resolution/update-turn-progress-query';
import { Turn, TurnResult } from '../../models/objects/database-objects';
import { getAdjResolutionDataQuery } from '../queries/resolution/get-adj-resolution-data-query';
import { insertNewUnitQuery, insertUnitHistoryQUery } from '../queries/resolution/insert-unit-queries';
import { updateAdjOrderQuery } from '../queries/resolution/adjustment-orders-query';
import { updateNominationQuery } from '../queries/resolution/update-nomination-query';
import { transferRemainingProvincesQuery } from '../queries/resolution/transfer-remaining-provinces-query';

export class ResolutionRepository {
  provinceHistoryCols: ColumnSet<unknown>;
  unitCols: ColumnSet<unknown>;
  unitHistoryCols: ColumnSet<unknown>;
  countryHistoryCols: ColumnSet<unknown>;
  pool = new Pool(envCredentials);

  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.provinceHistoryCols = new pgp.helpers.ColumnSet(
      ['province_id', 'turn_id', 'controller_id', 'province_status', 'valid_retreat'],
      { table: 'province_histories' }
    );

    this.unitCols = new pgp.helpers.ColumnSet(['country_id', 'unit_name', 'unit_type'], { table: 'units' });

    this.unitHistoryCols = new pgp.helpers.ColumnSet(
      ['unit_id', 'turn_id', 'node_id', 'unit_status', 'displacer_province_id', 'fallout_end_turn'],
      { table: 'unit_histories' }
    );

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

  async updateAdjustmentOrders(adjOrders: OrderAdjustmentRow[]): Promise<void> {
    adjOrders.forEach(async (adjOrder: OrderAdjustmentRow) => {
      if (adjOrder.buildType !== null) {
        await this.pool.query(updateAdjOrderQuery, [adjOrder.success, adjOrder.buildOrderId]);
      }
    });
  }

  async insertNewUnit(newUnits: InitialUnit[], turnId: number): Promise<void> {
    newUnits.forEach(async (unit: InitialUnit) => {
      this.pool.query(insertNewUnitQuery, [unit.countryId, unit.unitType, unit.unitName]).then(async (result: any) => {
        this.pool.query(insertUnitHistoryQUery, [result.rows[0].unit_id, turnId, unit.nodeId]);
      });
    });
  }

  async insertUnitHistories(unitHistories: Record<number, UnitHistoryRow>, turnId: number): Promise<void> {
    const unitHistoryValues = [];
    for (const unitId in unitHistories) {
      const unitHistory = unitHistories[unitId];
      unitHistoryValues.push({
        unit_id: unitHistory.unitId,
        turn_id: turnId,
        node_id: unitHistory.nodeId,
        unit_status: unitHistory.unitStatus,
        displacer_province_id: unitHistory.displacerProvinceId,
        fallout_end_turn: unitHistory.falloutEndTurn
      });
    }

    if (unitHistoryValues.length === 0) {
      terminalAddendum('Warning', `Array for bulk inserting unit histories is empty. Turn ${turnId}`);
      return;
    }

    const query = this.pgp.helpers.insert(unitHistoryValues, this.unitHistoryCols);
    this.db.none(query).catch((error: Error) => {
      terminalLog('Insert Unit Histories Error: ' + error.message);
    });
  }

  async insertProvinceHistories(provinceHistories: Record<number, ProvinceHistoryRow>, turnId: number): Promise<void> {
    const provinceHistoryValues = [];
    for (const provinceHistoryId in provinceHistories) {
      const provinceHistory = provinceHistories[provinceHistoryId];
      provinceHistoryValues.push( {
        province_id: provinceHistory.provinceId,
        turn_id: turnId,
        controller_id: provinceHistory.controllerId,
        capital_owner_id: provinceHistory.capitalOwnerId,
        province_status: provinceHistory.provinceStatus,
        valid_retreat: provinceHistory.validRetreat
      });
    }

    if (provinceHistoryValues.length === 0) {
      terminalAddendum('Warning', `Array for bulk inserting province histories is empty. Turn ${turnId}`);
      return;
    }

    const query = this.pgp.helpers.insert(provinceHistoryValues, this.provinceHistoryCols);
    this.db.query(query).catch((error: Error) => {
      terminalLog('Insert Province Histories Error: ' + error.message);
    });
  }

  async transferRemainingProvinces(provinceIds: number[], conqueringCountryId: number, turnId: number): Promise<void> {
    await this.pool.query(transferRemainingProvincesQuery, [conqueringCountryId, provinceIds, turnId]);
  }

  async insertCountryHistories(countryHistories: Record<string, CountryHistoryRow>, turnId: number): Promise<void> {
    const countryHistoryValues = [];
    for (let countryId in countryHistories) {
      const countryHistory = countryHistories[countryId];
      countryHistoryValues.push({
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
      });
    };

    if (countryHistoryValues.length === 0) {
      terminalAddendum('Warning', `Array for bulk inserting country histories is empty. Turn ${turnId}`);
      return;
    }

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
        province_status: provinceHistory.provinceStatus,
        valid_retreat: provinceHistory.validRetreat
      };
    });

    if (provinceHistoryValues.length === 0) {
      terminalAddendum(
        'Warning',
        `Array for bulk inserting province histories for bombard restorations is empty. Turn ${turnId}`
      );
      return;
    }

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
              eventNodeId: order.event_node_id,
              display: order.destination_display,
              cityType: order.city_type,
              provinceStatus: order.province_status,
              controllerId: order.controller_id,
              capitalOwnerId: order.capital_owner_id,
              validRetreat: true
            },
            secondaryUnit: {
              id: order.secondary_unit_id,
              type: order.secondary_unit_type,
              status: order.secondary_unit_status,
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
              cityType: order.destination_city_type,
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
            cityType: garrison.city_type,
            provinceStatus: garrison.province_status,
            controllerId: garrison.controller_id,
            capitalOwnerId: garrison.capital_owner_id,
            validRetreat: true
          },
          secondaryUnit: {
            id: garrison.secondary_unit_id,
            type: garrison.secondary_unit_type,
            status: garrison.secondary_unit_status,
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
            cityType: garrison.destination_city_type,
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

  async updateTurnProgress(turnId: number, newStatus: TurnStatus): Promise<Turn> {
    const updatedTurns = await this.pool
      .query(updateTurnProgressQuery, [newStatus, turnId])
      .then((result: QueryResult) =>
        result.rows.map((updatedTurn: TurnResult) => {
          return <Turn>{
            turnId: updatedTurn.turn_id,
            gameId: updatedTurn.game_id,
            turnNumber: updatedTurn.turn_number,
            turnName: updatedTurn.turn_name,
            turnType: updatedTurn.turn_type,
            turnStatus: updatedTurn.turn_status,
            yearNumber: updatedTurn.year_number,
            deadline: updatedTurn.deadline
          };
        })
      );

    return updatedTurns[0];
  }

  async saveVoteResults(nominations: Nomination[]): Promise<void> {
    nominations.forEach(async (nomination: Nomination) => {
      await this.pool.query(updateNominationQuery, [
        nomination.yayVoterIds,
        nomination.votesReceived,
        nomination.winDiff,
        nomination.winner,
        nomination.nominationId
      ]);
    });
  }

  async advancePreliminaryTurn(turnId: number): Promise<void> {
    await this.pool.query(advancePreliminaryTurnQuery, [turnId]);
  }

  /**
   * This is deprecated and is being moved to another repo
   * @param gameId
   * @param turnNumber
   * @returns
   */
  async getCountryStatCounts(gameId: number, turnNumber: number): Promise<CountryStatCounts[]> {
    return await this.pool
      .query(getCountryUnitCityCountsQuery, [gameId, turnNumber])
      .then((result: QueryResult) =>
        result.rows.map((country: CountryStatCountsResult) => {
          return <CountryStatCounts>{
            countryId: country.country_id,
            cityCount: Number(country.city_count),
            unitCount: Number(country.unit_count),
            adjustments: Number(country.city_count) - Number(country.unit_count),
            voteCount: Number(country.vote_count),
            occupyingCountryId: country.occupying_country_id,
            canClaimTerritory: country.can_claim_territory
          };
        })
      )
      .catch((error: Error) => {
        terminalLog('Get Country Stat Counts Error: ' + error.message);
        return [];
      });
  }

  async getAdjResolutionData(gameId: number, turnNumber: number, orderSetTurnId: number): Promise<AdjResolutionData[]> {
    return await this.pool
      .query(getAdjResolutionDataQuery, [gameId, turnNumber, orderSetTurnId])
      .then((result: QueryResult<AdjResolutionDataResult>) =>
        result.rows.map(
          (adjOrder: AdjResolutionDataResult) =>
            <AdjResolutionData>{
              orderSetId: adjOrder.order_set_id,
              countryId: adjOrder.country_id,
              countryName: adjOrder.country_name,
              adjustments: adjOrder.adjustments,
              bankedBuilds: adjOrder.banked_builds,
              nukesInProduction: adjOrder.nukes_in_production,
              nukeRange: adjOrder.nuke_range,
              builds: adjOrder.builds?.map(
                (build: BuildDetailsResult) =>
                  <BuildDetails>{
                    buildOrderId: build.build_order_id,
                    orderSetId: build.order_set_id,
                    countryId: build.country_id,
                    buildType: build.build_type,
                    buildNode: build.build_node,
                    destinationControllerId: build.destination_controller_id,
                    existingUnitId: build.existing_unit_id,
                    provinceName: build.province_name,
                    success: true
                  }
              ),
              disbands: adjOrder.disbands?.map(
                (disband: DisbandDetailsResult) =>
                  <DisbandDetails>{
                    unitId: disband.unit_id,
                    countryId: disband.country_id,
                    provinceName: disband.province_name,
                    nodeId: disband.node_id
                  }
              ),
              availableProvinces: adjOrder.available_province_result?.map((availableProvince: AvailableProvinceResult) =>
                <AvailableProvince>{
                  provinceId: availableProvince.province_id,
                  provinceName: availableProvince.province_name,
                  nodeId: availableProvince.node_id,
                  nodeName: availableProvince.node_name
                }
              ),
              increaseRange: adjOrder.increase_range,
              increaseRangeSuccess: adjOrder.increase_range_success,
              nomination: adjOrder.nomination,
              nominationSuccess: adjOrder.nomination_success
            }
        )
      );
  }
}
