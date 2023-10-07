import { Pool, QueryResult } from 'pg';
import { ColumnSet, IDatabase, IMain, ParameterizedQuery } from 'pg-promise';
import { BuildType } from '../../models/enumeration/unit-enum';
import {
  NominatableCountry,
  NominatableCountryResult,
  Order,
  OrderResult,
  OrderSet,
  OrderSetResult,
  TransferCountryResult
} from '../../models/objects/option-context-objects';
import { TransferBuildsCountry } from '../../models/objects/options-objects';
import {
  TransferBuildOrder,
  TransferTechOrder,
  TransferTechOrderResult,
  BuildOrders,
  BuildOrdersResult,
  BuildLocationResult,
  Build,
  DisbandOrders,
  DisbandOrdersResult,
  NukeBuildInDisband,
  DisbandingUnitDetail,
  DisbandingUnitDetailResult,
  BuildResult,
  TransferBuildOrderResult
} from '../../models/objects/order-objects';
import { CountryOrderSet, CountryOrderSetsResult } from '../../models/objects/orders/expected-order-types-object';
import { envCredentials } from '../../secrets/dbCredentials';
import { getTurnUnitOrdersQuery } from '../queries/orders/get-turn-unit-orders';
import { insertTurnOrderSetsQuery } from '../queries/orders/insert-turn-order-sets';
import { getBuildOrdersQuery } from '../queries/orders/orders-final/get-build-orders-query';
import { getBuildTransferOrdersQuery } from '../queries/orders/orders-final/get-build-transfer-orders-query';
import { getCountryOrderSets } from '../queries/orders/orders-final/get-country-order-sets-query';
import { getDisbandOrdersQuery } from '../queries/orders/orders-final/get-disband-orders-query';
import { getFinishedNukesOrdersQuery } from '../queries/orders/orders-final/get-finished-nuke-orders-query';
import { getNominationOrderQuery } from '../queries/orders/orders-final/get-nomination-order-query';
import { getTechTransferOrderQuery } from '../queries/orders/orders-final/get-tech-transfer-order-query';
import { getVotesOrdersQuery } from '../queries/orders/orders-final/get-votes-orders-query';
import { saveBuildOrdersQuery } from '../queries/orders/orders-final/save-build-orders-query';
import { saveDisbandOrdersQuery } from '../queries/orders/orders-final/save-disband-orders-query';
import { saveNominationQuery } from '../queries/orders/orders-final/save-nomination-query';
import { clearBuildTransferOrdersQuery, insertTechTransferOrdersQuery, updateTechTransferOrdersQuery } from '../queries/orders/orders-final/save-transfer-orders-query';
import { saveUnitOrderQuery } from '../queries/orders/orders-final/save-unit-order-query';
import { saveVotesQuery } from '../queries/orders/orders-final/save-votes-query';
import { setTurnDefaultsPreparedQuery } from '../queries/orders/set-turn-defaults-prepared-query';
import { saveBuildOrderQuery } from '../queries/orders/orders-final/save-build-order-query';
import { terminalLog } from '../../server/utils/general';

export class OrdersRepository {
  orderSetCols: ColumnSet<unknown>;
  orderCols: ColumnSet<unknown>;
  pool: Pool = new Pool(envCredentials);
  /**
   * @param db
   * @param pgp
   */
  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.orderSetCols = new pgp.helpers.ColumnSet(
      [
        'country_id',
        'turn_id',
        'message_id',
        'submission_time',
        'order_set_type',
        'order_set_name'
      ],
      { table: 'order_sets' }
    );

    this.orderCols = new pgp.helpers.ColumnSet(
      [
        'order_set_id',
        'order_type',
        'ordered_unit_id',
        'secondary_unit_id',
        'destination_id',
        'order_status',
        'order_success'
      ],
      { table: 'orders' }
    );
  }

  async saveDefaultOrders(defaultOrders: Order[]): Promise<void> {
    const orderValues = defaultOrders.map((order: Order) => {
      return {
        order_set_id: order.orderSetId,
        order_type: order.orderType,
        ordered_unit_id: order.orderedUnitId,
        destination_id: order.destinationId,
        secondary_unit_id: undefined,
        order_status: 'Default',
        order_success: false
      };
    });

    const query = this.pgp.helpers.insert(orderValues, this.orderCols);
    return this.db.query(query).catch((error: Error) => terminalLog('saveDefaultOrders error: ' + error.message));
  }

  async saveTechTransfer(orderSetId: number, techTransfer: TransferTechOrder): Promise<void> {
    const updateOrderPQ = new ParameterizedQuery({
      text: updateTechTransferOrdersQuery,
      values: [
        techTransfer.foreignCountryId,
        techTransfer.foreignCountryName,
        orderSetId
      ]
    });

    const updatedOrder = await this.db.oneOrNone(updateOrderPQ);

    if (!updatedOrder) {
      const insertOrderPQ = new ParameterizedQuery({
        text: insertTechTransferOrdersQuery,
        values: [
          orderSetId,
          techTransfer.foreignCountryId,
          techTransfer.foreignCountryName
        ]
      });

      await this.db.none(insertOrderPQ);
    }
  }

  async saveBuildTransfers(orderSetId: number, buildsTransferred: TransferBuildOrder[]): Promise<void> {
    const clearExtraPQ = new ParameterizedQuery({
      text: clearBuildTransferOrdersQuery,
      values: [orderSetId]
    });

    this.db.none(clearExtraPQ)
      .then(async () => {
        const values: any[] = [];

        buildsTransferred.forEach((buildTransfer: TransferBuildOrder, index: number) => {
          if (buildTransfer.foreignCountryId !== 0) {
            values.push({
              order_set_id: orderSetId,
              order_type: 1,
              foreign_country_id: buildTransfer.foreignCountryId,
              foreign_country_name: buildTransfer.foreignCountryName,
              quantity: buildTransfer.quantity,
              ui_row: index + 1,
              success: false
            });
          }
        });

        const query = this.pgp.helpers.insert(values, this.orderTransferCols);
        return this.db.query(query)
          .catch((error: Error) => terminalLog('saveBuildTransfers error: ' + error.message));
      });
  }

  //////////////////// Helper Functions ////////////////////

  resolveBuildType(buildTypeId: number): BuildType {
    switch (buildTypeId) {
      case -3:
        return BuildType.NUKE_START;
      case -2:
        return BuildType.RANGE;
      case -1:
        return BuildType.DISBAND;
      case 0:
        return BuildType.BUILD;
      case 1:
        return BuildType.ARMY;
      case 2:
        return BuildType.FLEET;
      case 3:
        return BuildType.WING;
      case 4:
        return BuildType.NUKE_RUSH;
      case 5:
        return BuildType.NUKE_FINISH;
      default:
        return BuildType.BUILD;
    }
  }

  resolveTypeId(buildType: BuildType): number {
    switch (buildType) {
      case BuildType.NUKE_START:
        return -3;
      case BuildType.RANGE:
        return -2;
      case BuildType.DISBAND:
        return -1;
      case BuildType.BUILD:
        return 0;
      case BuildType.ARMY:
        return 1;
      case BuildType.FLEET:
        return 2;
      case BuildType.WING:
        return 3;
      case BuildType.NUKE_RUSH:
        return 4;
      case BuildType.NUKE_FINISH:
        return 5;
      default:
        return NaN;
    }
  }

  //////////////////// Legacy Functions ////////////////////

  async insertTurnOrderSets(gameId: number, turnNumber: number, nextTurnId: number): Promise<OrderSet[]> {
    const orderSets: OrderSet[] = await this.pool
      .query(insertTurnOrderSetsQuery, [nextTurnId, gameId, turnNumber])
      .then((result: QueryResult<any>) =>
        result.rows.map((orderSetResult: OrderSetResult) => {
          return <OrderSet>{
            orderSetId: orderSetResult.order_set_id,
            countryId: orderSetResult.country_id,
            turnId: nextTurnId
          };
        })
      )
      .catch((error: Error) => {
        terminalLog(`Insert Turn Order Sets Query Error | (${gameId}, ${turnNumber}):` + error.message);
        return [];
      });

    return orderSets;
  }

  async setTurnDefaultsPrepped(turnId: number): Promise<void> {
    await this.pool
      .query(setTurnDefaultsPreparedQuery, [turnId])
      .catch((error: Error) => terminalLog('setTurnDefaultsPrepped error: ' + error.message));
  }

  async getTurnUnitOrders(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    countryId: number
  ): Promise<Order[]> {
    const orders: Order[] = await this.pool
      .query(getTurnUnitOrdersQuery, [gameId, turnNumber, orderTurnId, countryId])
      .then((result: QueryResult<any>) =>
        result.rows.map((orderResult: OrderResult) => {
          return <Order>{
            orderId: orderResult.order_id,
            orderSetId: orderResult.order_set_id,
            orderedUnitId: orderResult.ordered_unit_id,
            loc: orderResult.ordered_unit_loc,
            orderType: orderResult.order_type,
            secondaryUnitId: orderResult.secondary_unit_id,
            secondaryUnitLoc: orderResult.secondary_unit_loc,
            destinationId: orderResult.destination_id,
            eventLoc: orderResult.event_loc,
            orderStatus: orderResult.order_status
          };
        })
      );

    return orders;
  }

  async getBuildTransferOrders(countryId: number, turnId: number): Promise<TransferBuildOrder[]> {
    const transferBuildOrders: TransferBuildOrder[] = await this.pool
      .query(getBuildTransferOrdersQuery, [turnId, countryId])
      .then((result: QueryResult<TransferBuildOrderResult>) => result.rows.map((order: TransferBuildOrderResult) => {
        return <TransferBuildOrder> {
          orderTransferId: order.order_transfer_id,
          orderSetId: order.order_set_id,
          countryId: order.country_id,
          countryName: order.country_name,
          techPartnerId: order.tech_partner_id,
          techPartnerName: order.tech_partner_name,
          quantity: order.quantity,
          uiRow: order.ui_row
        };
      }));

    return transferBuildOrders;
  }

  /**
   * Retrieves tech transfer partners for a given country
   * @param orderTurnId
   * @param countryId
   * @returns
   */
  async getTechTransferPartner(
    orderTurnId: number,
    countryId: number
  ): Promise<TransferTechOrder[]> {
    const techTransferPartners = await this.pool
      .query(getTechTransferOrderQuery, [orderTurnId, countryId])
      .then((result: QueryResult) =>
        result.rows.map((order: TransferTechOrderResult) => {
          return <TransferTechOrder> {
            techTransferOrderId: order.tech_transfer_order_id,
            orderSetId: order.order_set_id,
            countryId: order.country_id,
            countryName: order.country_name,
            offering: order.offering,
            foreignCountryId: order.foreign_country_id,
            foreignCountryName: order.foreign_country_name,
            description: order.description,
            resolution: order.resolution,
            success: order.success
          };
        })
      );

    return techTransferPartners.length === 0
      ? [
          <TransferTechOrder> {
            techTransferOrderId: 0,
            orderSetId: 0,
            countryId: 0,
            countryName: '',
            offering: false,
            foreignCountryId: 0,
            foreignCountryName: '',
            description: 'Orders not submitted',
            resolution: '',
            success: false
          }
        ]
      : techTransferPartners;
  }

  async getBuildOrders(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    countryId: number
  ): Promise<BuildOrders[]> {
    return await this.pool
      .query(getBuildOrdersQuery, [gameId, turnNumber, orderTurnId, countryId])
      .then((result: QueryResult) =>
        result.rows.map((result: BuildOrdersResult) => {
          return <BuildOrders>{
            countryId: result.country_id,
            countryName: result.country_name,
            bankedBuilds: result.banked_builds,
            buildCount: result.adjustments,
            nukeRange: result.nuke_range,
            increaseRange: result.increase_range,
            builds: result.builds.map((build: BuildResult) => {
              return <Build>{
                buildNumber: build.build_number,
                buildType: build.build_type,
                typeId: this.resolveTypeId(build.build_type),
                nodeId: build.node_id,
                nodeName: build.node_name,
                provinceName: build.province_name,
                loc: build.loc
              };
            })
          };
        })
      );
  }

  async getDisbandOrders(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    countryId: number
  ): Promise<DisbandOrders> {
    const disbandOrders: DisbandOrders[] = await this.pool
      .query(getDisbandOrdersQuery, [gameId, turnNumber, orderTurnId, countryId])
      .then((result: QueryResult) =>
        result.rows.map((orderSet: DisbandOrdersResult) => {
          return <DisbandOrders>{
            countryId: orderSet.country_id,
            countryName: orderSet.country_name,
            bankedBuilds: orderSet.banked_builds,
            disbands: orderSet.disbands,
            unitsDisbanding: orderSet.units_disbanding,
            nukeLocs: orderSet.nuke_locs,
            unitDisbandingDetailed: orderSet.unit_disbanding_detailed.map(
              (unit: DisbandingUnitDetailResult, index: number) => {
                return <DisbandingUnitDetail>{
                  unitId: unit.unit_id,
                  unitType: unit.unit_type,
                  provinceName: unit.province_name,
                  loc: unit.loc
                };
              }
            ),
            nukeRange: orderSet.nuke_range,
            increaseRange: orderSet.increase_range
          };
        })
      );

    return disbandOrders[0];
  }

  async getCountryOrderSets(gameId: number, turnId: number, countryId: number): Promise<CountryOrderSet[]> {
    return await this.pool.query(getCountryOrderSets, [gameId, turnId, countryId]).then((result: QueryResult) =>
      result.rows.map((orderSet: CountryOrderSetsResult) => {
        return <CountryOrderSet>{
          orderSetId: orderSet.order_set_id,
          turnStatus: orderSet.turn_status,
          turnType: orderSet.turn_type,
          adjustments: orderSet.adjustments,
          inRetreat: orderSet.in_retreat
        };
      })
    );
  }

  async saveUnitOrder(orderSetId: number, unit: Order): Promise<void> {
    await this.pool
      .query(saveUnitOrderQuery, [
        unit.orderType,
        unit.secondaryUnitId,
        unit.destinationId,
        'Submitted',
        orderSetId,
        unit.orderedUnitId
      ])
      .catch((error: Error) => terminalLog(`saveUnitOrder (${unit.orderedUnitId}) error: ` + error.message));
  }

  async saveBuildOrder(orderSetId: number, build: Build): Promise<void> {
    await this.pool
      .query(saveBuildOrderQuery, [build.buildType, build.nodeId, orderSetId, build.buildNumber])
      .catch((error: Error) => terminalLog(`saveBuildOrder (${build.nodeId}) error: ${error.message}`));
  }



  async saveBuildOrders(orderSetId: number, builds: BuildOrders): Promise<void> {
    const buildLocs: number[] = [];
    const buildLocsTupleized: number[] = [];

    builds.builds.forEach((build: Build) => {
      buildLocs.push(build.nodeId);
      buildLocsTupleized.push(build.nodeId, build.typeId);
    });

    let nukeLocs: number[] = [];

    if (builds.nukesReady) {
      nukeLocs = builds.nukesReady.map((nukeLoc: Build) => nukeLoc.nodeId);
    }

    await this.pool
      .query(saveBuildOrdersQuery, [buildLocs, buildLocsTupleized, nukeLocs, builds.increaseRange, orderSetId])
      .catch((error: Error) => terminalLog('saveBuildOrders error: ' + error.message));
  }

  async saveDisbandOrders(orderSetId: number, disbands: DisbandOrders): Promise<void> {
    await this.pool
      .query(saveDisbandOrdersQuery, [disbands.unitsDisbanding, disbands.increaseRange, disbands.nukeLocs, orderSetId])
      .catch((error: Error) => terminalLog('saveDisbandOrders error: ' + error.message));
  }

  async getNukesReadyLocs(nextTurnId: number, countryId: number): Promise<NukeBuildInDisband[]> {
    return await this.pool.query(getFinishedNukesOrdersQuery, [nextTurnId, countryId]).then((result: QueryResult) =>
      result.rows.map((loc: BuildLocationResult, index: number) => {
        return <NukeBuildInDisband>{
          unitId: index * -1,
          nodeId: loc.node_id,
          province: loc.province_name,
          display: loc.province_name,
          loc: loc.loc
        };
      })
    );
  }

  async getNominationOrder(turnId: number, countryId: number): Promise<NominatableCountry[]> {
    return await this.pool.query(getNominationOrderQuery, [turnId, countryId]).then((result: QueryResult) =>
      result.rows.map((country: NominatableCountryResult) => {
        return <NominatableCountry>{
          countryId: country.country_id,
          countryName: country.country_name,
          rank: country.rank
        };
      })
    );
  }

  async saveNominationOrder(orderSetId: number, nomination: number[]): Promise<void> {
    await this.pool
      .query(saveNominationQuery, [nomination, orderSetId])
      .catch((error: Error) => terminalLog('saveNominationOrder error: ' + error.message));
  }

  async getVotes(turnId: number, countryId: number): Promise<number[]> {
    return await this.pool
      .query(getVotesOrdersQuery, [turnId, countryId])
      .then((result: QueryResult) => (result.rows[0].votes ? result.rows[0].votes : []));
  }

  async saveVotes(orderSetId: number, votes: number[]): Promise<void> {
    await this.pool
      .query(saveVotesQuery, [votes, orderSetId])
      .catch((error: Error) => terminalLog('saveVotes error: ' + error.message));
  }

  async updateOrderSetSubmissionTime(orderSetId: number): Promise<void> {
    await this.pool
      .query('UPDATE order_sets SET submission_time = NOW() WHERE order_set_id = $1', [orderSetId])
      .catch((error: Error) => terminalLog('updateOrderSubmissionTime error: ' + error.message));
  }
}
