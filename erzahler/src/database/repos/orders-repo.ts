import { Pool, QueryResult } from 'pg';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';
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
  TransferBuildOrdersResults,
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
  BuildResult
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
import { saveTransferOrdersQuery } from '../queries/orders/orders-final/save-transfer-orders-query';
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
      ['country_id', 'turn_id', 'message_id', 'submission_time', 'order_set_type', 'order_set_name'],
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
        order_success: undefined
      };
    });

    const query = this.pgp.helpers.insert(orderValues, this.orderCols);
    return this.db.query(query).catch((error: Error) => terminalLog('saveDefaultOrders error: ' + error.message));
  }

  //// Legacy Functions ////

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
    const transferBuildOrderResults: TransferBuildOrdersResults[] = await this.pool
      .query(getBuildTransferOrdersQuery, [turnId, countryId])
      .then((result: QueryResult) => result.rows);

    const transferBuildOrders: TransferBuildOrder[] = [];
    transferBuildOrderResults.forEach((result: TransferBuildOrdersResults) => {
      const tuples = result.build_transfer_tuples;
      const recipients: TransferCountryResult[] = result.build_transfer_recipients;

      for (let index = 0; index < tuples.length; index += 2) {
        const recipient = recipients.find((country: TransferCountryResult) => country.country_id === tuples[index]);
        if (recipient) {
          transferBuildOrders.push({
            playerCountryId: result.player_country_id,
            playerCountryName: result.player_country_name,
            countryId: recipient.country_id,
            countryName: recipient.country_name,
            builds: tuples[index + 1]
          });
        }
      }
    });

    return transferBuildOrders;
  }

  async getTechTransferPartner(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    countryId: number
  ): Promise<TransferTechOrder[]> {
    return await this.pool
      .query(getTechTransferOrderQuery, [gameId, turnNumber, orderTurnId, countryId])
      .then((result: QueryResult) =>
        result.rows.map((order: TransferTechOrderResult) => {
          return <TransferTechOrder>{
            countryId: order.country_id,
            countryName: order.country_name,
            techPartnerId: order.tech_partner_id,
            techPartnerName: order.tech_partner_name,
            hasNukes: order.has_nukes,
            success: false
          };
        })
      );
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

  async saveTransfers(
    orderSetId: number,
    techTransfer: TransferTechOrder,
    buildTransfers: TransferBuildsCountry[]
  ): Promise<void> {
    const buildRecipients: number[] = [];
    const tupleizedBuildRecipients: number[] = [];

    buildTransfers.forEach((transfer: TransferBuildsCountry) => {
      buildRecipients.push(transfer.countryId);
      tupleizedBuildRecipients.push(transfer.countryId, transfer.builds);
    });

    await this.pool
      .query(saveTransferOrdersQuery, [
        techTransfer.techPartnerId,
        buildRecipients,
        tupleizedBuildRecipients,
        orderSetId
      ])
      .catch((error: Error) => terminalLog('saveTransfers error: ' + error.message));
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
}
