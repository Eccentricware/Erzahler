import { Pool, QueryResult } from 'pg';
import { ColumnSet, IDatabase, IMain, ParameterizedQuery } from 'pg-promise';
import { BuildType } from '../../models/enumeration/unit-enum';
import {
  CountryVotes,
  CountryVotesResult,
  NominatableCountry,
  NominatableCountryResult,
  Order,
  OrderResult,
  OrderSet,
  OrderSetResult
} from '../../models/objects/option-context-objects';
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
import {
  CountryOrderSet,
  CountryOrderSetIds,
  CountryOrderSetsResult
} from '../../models/objects/orders/expected-order-types-object';
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
import { getVotesForResolutionQuery, getVotesOrdersQuery } from '../queries/orders/orders-final/get-votes-orders-query';
import { saveBuildOrdersQuery } from '../queries/orders/orders-final/save-build-orders-query';
import { saveDisbandOrdersQuery } from '../queries/orders/orders-final/save-disband-orders-query';
import { saveNominationQuery } from '../queries/orders/orders-final/save-nomination-query';
import {
  clearBuildTransferOrdersQuery,
  insertTechTransferOrdersQuery,
  updateTechTransferOrdersQuery
} from '../queries/orders/orders-final/save-transfer-orders-query';
import { saveUnitOrderQuery } from '../queries/orders/orders-final/save-unit-order-query';
import { saveVotesQuery } from '../queries/orders/orders-final/save-votes-query';
import { setTurnDefaultsPreparedQuery } from '../queries/orders/set-turn-defaults-prepared-query';
import {
  insertBuildOrderQuery,
  updateBuildOrderQuery,
  updateBuildOrderSetQuery
} from '../queries/orders/orders-final/save-build-order-query';
import { terminalAddendum, terminalLog } from '../../server/utils/general';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { getCountryOrderSetIdsQuery } from '../queries/orders/orders-prep/get-country-order-set-ids';
import { NominationRow } from '../../models/objects/database-objects';
import { UpcomingTurn } from '../../models/objects/scheduler/upcoming-turns-object';

export class OrdersRepository {
  orderSetCols: ColumnSet<unknown>;
  orderCols: ColumnSet<unknown>;
  buildOrderTransferCols: ColumnSet<unknown>;
  nominationCols: ColumnSet<unknown>;
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

    this.buildOrderTransferCols = new pgp.helpers.ColumnSet(
      ['order_set_id', 'recipient_id', 'recipient_name', 'quantity', 'ui_row'],
      { table: 'orders_transfer_builds' }
    );

    this.nominationCols = new pgp.helpers.ColumnSet(
      ['turn_id', 'nominator_id', 'country_ids', 'signature', 'votes_required'],
      { table: 'nominations' }
    );
  }

  async insertRetreatedOrderSets(nowPendingTurnId: number, retreatingCountryIds: number[]): Promise<OrderSet[]> {
    const orderSetValues = retreatingCountryIds.map((countryId: number) => {
      return {
        country_id: countryId,
        turn_id: nowPendingTurnId,
        message_id: null,
        submission_time: new Date(),
        order_set_type: 'Orders',
        order_set_name: null
      };
    });

    if (orderSetValues.length === 0) {
      terminalAddendum('Warning', `Array for bulk insert orderSetValues is empty. Turn ${nowPendingTurnId}`);
      return [];
    }

    const query = this.pgp.helpers.insert(orderSetValues, this.orderSetCols) + 'RETURNING order_set_id, country_id';

    return this.db.query(query).then((result) =>
      result.map(
        (orderSetResult: OrderSetResult) =>
          <OrderSet>{
            orderSetId: orderSetResult.order_set_id,
            countryId: orderSetResult.country_id
          }
      )
    );
  }

  async insertDefaultOrders(defaultOrders: Order[]): Promise<void> {
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

    if (orderValues.length === 0) {
      terminalAddendum('Warning', 'Array for bulk insert orderValues is empty.');
      return;
    }

    const query = this.pgp.helpers.insert(orderValues, this.orderCols);
    return this.db.query(query).catch((error: Error) => terminalLog('insertDefaultOrders error: ' + error.message));
  }

  async saveTechTransfer(techTransfer: TransferTechOrder): Promise<void> {
    const updateOrderPQ = new ParameterizedQuery({
      text: updateTechTransferOrdersQuery,
      values: [techTransfer.foreignCountryId, techTransfer.foreignCountryName, techTransfer.orderSetId]
    });

    const updatedOrder = await this.db.oneOrNone(updateOrderPQ);

    if (!updatedOrder) {
      const insertOrderPQ = new ParameterizedQuery({
        text: insertTechTransferOrdersQuery,
        values: [techTransfer.orderSetId, techTransfer.foreignCountryId, techTransfer.foreignCountryName]
      });

      await this.db.none(insertOrderPQ);
    }
  }

  async saveBuildTransfers(orderSetId: number, buildsTransferred: TransferBuildOrder[]): Promise<void> {
    const clearExtraPQ = new ParameterizedQuery({
      text: clearBuildTransferOrdersQuery,
      values: [orderSetId]
    });

    this.db.none(clearExtraPQ).then(async () => {
      const values: any[] = [];

      buildsTransferred.forEach((buildTransfer: TransferBuildOrder, index: number) => {
        if (buildTransfer.recipientId !== 0) {
          values.push({
            order_set_id: orderSetId,
            recipient_id: buildTransfer.recipientId,
            recipient_name: buildTransfer.recipientName,
            quantity: buildTransfer.quantity,
            ui_row: index + 1
          });
        }
      });

      if (values.length > 0) {
        const query = this.pgp.helpers.insert(values, this.buildOrderTransferCols);
        return this.db.query(query).catch((error: Error) => terminalLog('saveBuildTransfers error: ' + error.message));
      }
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

  async insertTurnOrderSets(
    gameId: number,
    turnNumber: number,
    nextTurnId: number,
    nextTurnType: TurnType
  ): Promise<OrderSet[]> {
    const orderSets: OrderSet[] = await this.pool
      .query(insertTurnOrderSetsQuery, [nextTurnId, gameId, turnNumber, nextTurnType])
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
      .then((result: QueryResult<OrderResult>) =>
        result.rows.map(
          (orderResult: OrderResult) =>
            <Order>{
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
            }
        )
      );

    return orders;
  }

  async getBuildTransferOrders(countryId: number, turnId: number): Promise<TransferBuildOrder[]> {
    const transferBuildOrders: TransferBuildOrder[] = await this.pool
      .query(getBuildTransferOrdersQuery, [turnId, countryId])
      .then((result: QueryResult<TransferBuildOrderResult>) =>
        result.rows.map((order: TransferBuildOrderResult) => {
          return <TransferBuildOrder>{
            buildTransferOrderId: order.build_transfer_order_id,
            orderSetId: order.order_set_id,
            countryId: order.country_id,
            countryName: order.country_name,
            recipientId: order.recipient_id,
            recipientName: order.recipient_name,
            quantity: order.quantity,
            uiRow: order.ui_row
          };
        })
      );

    return transferBuildOrders;
  }

  /**
   * Retrieves tech transfer partners for a given country
   * @param orderTurnId
   * @param countryId
   * @returns
   */
  async getTechTransferPartners(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    countryId: number
  ): Promise<TransferTechOrder[]> {
    const techTransferPartners = await this.pool
      .query(getTechTransferOrderQuery, [gameId, turnNumber, orderTurnId, countryId])
      .then((result: QueryResult) =>
        result.rows.map((order: TransferTechOrderResult) => {
          return <TransferTechOrder>{
            techTransferOrderId: order.tech_transfer_order_id,
            orderSetId: order.order_set_id,
            countryId: order.country_id,
            countryName: order.country_name,
            hasNukes: order.has_nukes,
            foreignCountryId: order.foreign_country_id,
            foreignCountryName: order.foreign_country_name,
            description: order.description,
            resolution: order.resolution,
            success: order.success
          };
        })
      );

    return techTransferPartners;
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
            builds: result.builds
              ? result.builds.map((build: BuildResult) => {
                  let locDisplay: string | string[] | undefined;
                  if (!build.node_display) {
                    locDisplay = build.node_name?.toUpperCase().split('_');
                    if (locDisplay) {
                      locDisplay = locDisplay[2] ? `${locDisplay[0]} ${locDisplay[2]}` : locDisplay[0];
                    }
                  }

                  return <Build>{
                    orderSetId: build.order_set_id,
                    buildNumber: build.build_number,
                    buildType: build.build_type,
                    typeId: this.resolveTypeId(build.build_type),
                    nodeId: build.node_id,
                    nodeName: build.node_name,
                    nodeDisplay: build.node_display ? build.node_display : locDisplay,
                    provinceName: build.province_name,
                    loc: build.loc
                  };
                })
              : []
          };
        })
      );
  }

  async getDisbandOrders(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    countryId: number
  ): Promise<DisbandOrders[]> {
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
            // nukeLocs: orderSet.nuke_locs,
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

    return disbandOrders;
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

  async getCountryOrderSetIds(countryId: number): Promise<CountryOrderSetIds> {
    return await this.pool.query(getCountryOrderSetIdsQuery, [countryId]).then((result: QueryResult) => {
      return <CountryOrderSetIds>{
        countryId: result.rows[0] ? result.rows[0].country_id : 0,
        pendingOrderSetId: result.rows[0] ? result.rows[0].pending_order_set_id : 0,
        preliminaryOrderSetId: result.rows[0] ? result.rows[0].preliminary_order_set_id : 0
      };
    });
  }

  async saveUnitOrder(unitOrder: Order): Promise<void> {
    await this.pool
      .query(saveUnitOrderQuery, [
        unitOrder.orderType,
        unitOrder.secondaryUnitId,
        unitOrder.destinationId,
        'Submitted',
        unitOrder.orderSetId,
        unitOrder.orderedUnitId
      ])
      .catch((error: Error) => terminalLog(`saveUnitOrder (${unitOrder.orderedUnitId}) error: ` + error.message));
  }

  async saveDefaultBuildOrder(buildOrder: Build): Promise<void> {
    await this.pool
      .query(insertBuildOrderQuery, [
        buildOrder.orderSetId,
        buildOrder.buildNumber,
        buildOrder.buildType,
        buildOrder.nodeId
      ])
      .catch((error: Error) => terminalLog(`saveDefaultBuildOrder (${buildOrder.nodeId}) error: ${error.message}`));
  }

  async updateBuildOrderSet(orderSetId: number, increaseRange: number): Promise<void> {
    await this.pool
      .query(updateBuildOrderSetQuery, [increaseRange, orderSetId])
      .catch((error: Error) => terminalLog(`updateBuildOrderSet (${orderSetId}) error: ${error.message}`));
  }

  async saveBuildOrder(orderSetId: number, build: Build, buildNumber: number): Promise<void> {
    await this.pool
      .query(updateBuildOrderQuery, [build.buildType, build.nodeId, orderSetId, buildNumber])
      .catch((error: Error) => terminalLog(`saveBuildOrder (${orderSetId}) error: ${error.message}`));
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

  async saveDisbandOrders(orderSetId: number, disbands: DisbandOrders): Promise<boolean> {
    return await this.pool
      .query(saveDisbandOrdersQuery, [disbands.unitsDisbanding, disbands.increaseRange, orderSetId])
      .then(() => true)
      .catch((error: Error) => {
        terminalLog('saveDisbandOrders error: ' + error.message);
        return false;
      });
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

  async getNominationOrder(
    gameId: number,
    turnNumber: number,
    turnId: number,
    countryId: number
  ): Promise<NominatableCountry[]> {
    return await this.pool
      .query(getNominationOrderQuery, [gameId, turnNumber, turnId, countryId])
      .then((result: QueryResult) =>
        result.rows.map((country: NominatableCountryResult) => {
          return <NominatableCountry>{
            nominatorId: country.nominator_id,
            countryId: country.country_id,
            countryName: country.country_name,
            rank: country.rank,
            countryStatus: country.country_status
          };
        })
      );
  }

  async saveNominationOrder(orderSetId: number, nomination: number[]): Promise<void> {
    await this.pool
      .query(saveNominationQuery, [nomination, orderSetId])
      .catch((error: Error) => terminalLog('saveNominationOrder error: ' + error.message));
  }

  async insertNominations(nominations: NominationRow[], turnId: number): Promise<void> {
    const nominationValues = nominations.map((nomination: NominationRow) => {
      return {
        turn_id: turnId,
        nominator_id: nomination.nominatorId,
        country_ids: nomination.countryIds,
        signature: nomination.signature.toUpperCase(),
        votes_required: nomination.votesRequired
      };
    });

    if (nominationValues.length === 0) {
      terminalAddendum('Warning', 'Array for bulk insert nominationValues is empty. Turn ' + turnId);
      return;
    }
    const insertNomsQuery = this.pgp.helpers.insert(nominationValues, this.nominationCols);
    return this.db
      .query(insertNomsQuery)
      .catch((error: Error) => terminalLog('insertNominations error: ' + error.message));
  }

  async getVotes(turnId: number, countryId: number): Promise<number[]> {
    return await this.pool
      .query(getVotesOrdersQuery, [turnId, countryId])
      .then((result: QueryResult) => (result.rows[0] && result.rows[0].votes ? result.rows[0].votes : []));
  }

  async getVotesForResolution(turn: UpcomingTurn): Promise<CountryVotes[]> {
    return await this.pool
      .query(getVotesForResolutionQuery, [turn.gameId, turn.turnNumber, turn.turnId])
      .then((result: QueryResult<CountryVotesResult>) =>
        result.rows.map((vote: CountryVotesResult) => {
          return <CountryVotes>{
            countryId: vote.country_id,
            votes: vote.votes,
            voteCount: vote.vote_count
          };
        })
      );
  }

  async saveVotes(votes: number[], orderSetId: number): Promise<void> {
    await this.pool
      .query(saveVotesQuery, [votes, orderSetId])
      .catch((error: Error) => terminalLog('saveVotes error: ' + error.message));
  }

  async updateOrderSetSubmissionTime(orderSetId: number): Promise<void> {
    await this.pool
      .query('UPDATE order_sets SET submission_time = NOW() WHERE order_set_id = $1', [orderSetId])
      .catch((error: Error) => terminalLog('updateOrderSubmissionTime error: ' + error.message));
  }

  async insertNominationOrderSets(turnId: number, survivingCountryIds: number[]): Promise<void> {
    const orderSetValues = survivingCountryIds.map((countryId: number) => {
      return {
        country_id: countryId,
        turn_id: turnId,
        message_id: null,
        submission_time: new Date(),
        order_set_type: 'Orders',
        order_set_name: null
      };
    });

    if (orderSetValues.length === 0) {
      terminalAddendum('Warning', `Array for bulk insert nomination orderSetValues is empty. Turn ${turnId}`);
      return;
    }

    const query = this.pgp.helpers.insert(orderSetValues, this.orderSetCols);
    return this.db.query(query).catch((error: Error) => terminalLog('insertVotingOrderSets error: ' + error.message));
  }

  async insertVotingOrderSets(turnId: number, survivingCountryIds: number[]): Promise<void> {
    const orderSetValues = survivingCountryIds.map((countryId: number) => {
      return {
        country_id: countryId,
        turn_id: turnId,
        message_id: null,
        submission_time: new Date(),
        order_set_type: 'Orders',
        order_set_name: null
      };
    });

    if (orderSetValues.length === 0) {
      terminalAddendum('Warning', `Array for bulk insert voting orderSetValues is empty. Turn ${turnId}`);
      return;
    }

    const query = this.pgp.helpers.insert(orderSetValues, this.orderSetCols);
    return this.db.query(query).catch((error: Error) => terminalLog('insertVotingOrderSets error: ' + error.message));
  }
}
