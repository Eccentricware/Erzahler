import { error } from "console";
import { Pool, QueryResult } from "pg";
import { ColumnSet, IDatabase, IMain, queryResult } from "pg-promise";
import { BuildType, UnitType } from "../../models/enumeration/unit-enum";
import { CountryState } from "../../models/objects/games/country-state-objects";
import { AdjacenctMovement, AdjacenctMovementResult, AirAdjacency, AtRiskUnit, AtRiskUnitResult, BuildLoc, BuildLocResult, DestinationResult, NominatableCountry, NominatableCountryResult, Nomination, NominationResult, Order, OrderOption, OrderResult, OrderSet, OrderSetResult, SavedDestination, SavedOption, SavedOptionResult, TransferCountry, TransferCountryResult, TransferOption, TransferOptionResult, UnitAdjacyInfoResult, UnitOptions } from "../../models/objects/option-context-objects";
import { TransferBuildsCountry, TransferTechCountry } from "../../models/objects/options-objects";
import { TransferBuildOrder, TransferBuildOrdersResults, TransferTechOrder, TransferTechOrderResult, BuildOrders, BuildOrdersResult, BuildLocationResult, Build, DisbandOrders, DisbandOrdersResult, NukeBuildInDisband, DisbandingUnitDetail, DisbandingUnitDetailResult } from "../../models/objects/order-objects";
import { CountryOrderSet, CountryOrderSetsResult } from "../../models/objects/orders/expected-order-types-object";
import { victorCredentials } from "../../secrets/dbCredentials";
import { getAirAdjQuery } from "../queries/orders/get-air-adj-query";
import { getAtRiskUnitsQuery } from "../queries/orders/get-at-risk-units-query";
import { getEmptySupplyCentersQuery } from "../queries/orders/get-empty-supply-centers-query";
import { getNominatableCountriesQuery } from "../queries/orders/get-nominatable-countries-query";
import { getOrderOptionsQuery } from "../queries/orders/get-order-options-query";
import { getOrderSetQuery } from "../queries/orders/get-order-set-query";
import { getTransferBuildOptionsQuery } from "../queries/orders/get-transfer-build-options-query";
import { getTransferOptionsQuery } from "../queries/orders/get-transfer-options-query";
import { getTechOfferOptionsQuery } from "../queries/orders/get-transfer-tech-offer-options-query";
import { getTechReceiveOptionsQuery } from "../queries/orders/get-transfer-tech-receive-options-query";
import { getTurnUnitOrdersQuery } from "../queries/orders/get-turn-unit-orders";
import { getUnitAdjacentInfoQuery } from "../queries/orders/get-unit-adjacent-info-query";
import { insertTurnOrderSetsQuery } from "../queries/orders/insert-turn-order-sets";
import { getBuildOrdersQuery } from "../queries/orders/orders-final/get-build-orders-query";
import { getBuildTransferOrdersQuery } from "../queries/orders/orders-final/get-build-transfer-orders-query";
import { getCountryOrderSets } from "../queries/orders/orders-final/get-country-order-sets-query";
import { getDisbandOrdersQuery } from "../queries/orders/orders-final/get-disband-orders-query";
import { getFinishedNukesOrdersQuery } from "../queries/orders/orders-final/get-finished-nuke-orders-query";
import { getNominationOrderQuery } from "../queries/orders/orders-final/get-nomination-order-query";
import { getTechTransferOrderQuery } from "../queries/orders/orders-final/get-tech-transfer-order-query";
import { getVotesOrdersQuery } from "../queries/orders/orders-final/get-votes-orders-query";
import { saveBuildOrdersQuery } from "../queries/orders/orders-final/save-build-orders-query";
import { saveDisbandOrdersQuery } from "../queries/orders/orders-final/save-disband-orders-query";
import { saveNominationQuery } from "../queries/orders/orders-final/save-nomination-query";
import { saveTransferOrdersQuery } from "../queries/orders/orders-final/save-transfer-orders-query";
import { saveUnitOrderQuery } from "../queries/orders/orders-final/save-unit-order-query";
import { saveVotesQuery } from "../queries/orders/orders-final/save-votes-query";
import { setTurnDefaultsPreparedQuery } from "../queries/orders/set-turn-defaults-prepared-query";

export class OrdersRepository {
  orderSetCols: ColumnSet<unknown>;
  orderCols: ColumnSet<unknown>;
  orderOptionsCols: ColumnSet<unknown>;
  pool: Pool = new Pool(victorCredentials);
  /**
   * @param db
   * @param pgp
   */
  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.orderSetCols = new pgp.helpers.ColumnSet([
      'country_id',
      'turn_id',
      'message_id',
      'submission_time',
      'order_set_type',
      'order_set_name'
    ], { table: 'order_sets' });

    this.orderCols = new pgp.helpers.ColumnSet([
      'order_set_id',
      'order_type',
      'ordered_unit_id',
      'secondary_unit_id',
      'destination_id',
      'order_status',
      'order_success'
    ], { table: 'orders' });

    this.orderOptionsCols = new pgp.helpers.ColumnSet([
      'unit_id',
      'order_type',
      'secondary_unit_id',
      'secondary_order_type',
      'destinations',
      'turn_id'
    ], { table: 'order_options' });
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
      }
    });

    const query = this.pgp.helpers.insert(orderValues, this.orderCols);
    return this.db.query(query);
  }

  //// Legacy Functions ////

  async insertTurnOrderSets(currentTurnId: number, nextTurnId: number): Promise<OrderSet[]> {
    const orderSets: OrderSet[] = await this.pool.query(insertTurnOrderSetsQuery, [nextTurnId, currentTurnId])
      .then((result: QueryResult<any>) => result.rows.map((orderSetResult: OrderSetResult) => {
        return <OrderSet> {
          orderSetId: orderSetResult.order_set_id,
          countryId: orderSetResult.country_id,
          turnId: nextTurnId
        }
      }));

    return orderSets;
  }

  async setTurnDefaultsPrepped(turnId: number): Promise<void> {
    await this.pool.query(setTurnDefaultsPreparedQuery, [turnId]);
  }

  async getTurnUnitOrders(countryId: number, orderTurnId: number, historyTurnId: number): Promise<Order[]> {
    const orders: Order[] = await this.pool.query(getTurnUnitOrdersQuery, [countryId, orderTurnId, historyTurnId])
      .then((result: QueryResult<any>) => result.rows.map((orderResult: OrderResult) => {
        return <Order> {
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
      }));

    return orders;
  }

  async getBuildTransferOrders(countryId: number, turnId: number): Promise<TransferBuildOrder[]> {
    const transferBuildOrderResults: TransferBuildOrdersResults[] = await this.pool.query(getBuildTransferOrdersQuery, [turnId, countryId])
      .then((result: QueryResult) => result.rows);

    const transferBuildOrders: TransferBuildOrder[] = [];
    transferBuildOrderResults.forEach((result: TransferBuildOrdersResults) => {
      const tuples = result.build_transfer_tuples;
      const recipients: TransferCountryResult[] = result.build_transfer_recipients;

      for (let index = 0; index < tuples.length; index += 2) {
        let recipient = recipients.find((country: TransferCountryResult) => country.country_id === tuples[index]);
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

    return transferBuildOrders
  }

  async getTechTransferPartner(nextTurnId: number, currentTurnId: number, countryId: number): Promise<TransferTechOrder[]> {
    return await this.pool.query(getTechTransferOrderQuery, [nextTurnId, currentTurnId, countryId])
     .then((result: QueryResult) => result.rows.map((order: TransferTechOrderResult) => {
      return <TransferTechOrder> {
        countryId: order.country_id,
        countryName: order.country_name,
        techPartnerId: order.tech_partner_id,
        techPartnerName: order.tech_partner_name,
        hasNukes: order.has_nukes
      };
     }));
  }

  async getBuildOrders(currentTurnId: number, nextTurnId: number, countryId: number): Promise<BuildOrders[]> {
    const buildOrdersResults: BuildOrdersResult[] = await this.pool.query(getBuildOrdersQuery, [nextTurnId, currentTurnId, countryId])
      .then((result: QueryResult) => result.rows);

    const buildOrders: BuildOrders[] = [];
    buildOrdersResults.forEach((result: BuildOrdersResult) => {
      const builds: Build[] = [];
      if (result.build_tuples?.length > 0) {
        const buildTuples: number[] = result.build_tuples;
        const buildLocs: BuildLocationResult[] = result.build_locs;

        for (let index = 0; index < buildTuples.length; index += 2) {
          const buildLoc = buildLocs.find((loc: BuildLocationResult) => loc.node_id === buildTuples[index]);
          const buildTypeId = buildTuples[index + 1];
          let buildType = this.resolveBuildType(buildTypeId);

          if (buildLoc) {
            builds.push({
              typeId: buildTypeId,
              buildType: buildType,
              nodeId: buildLoc.node_id,
              nodeName: buildLoc.node_name,
              provinceName: buildLoc.province_name,
              loc: buildLoc.loc
            });
          };
        }
      }

      buildOrders.push({
        countryId: result.country_id,
        countryName: result.country_name,
        bankedBuilds: result.banked_builds,
        buildCount: result.builds,
        nukeRange: result.nuke_range,
        increaseRange: result.increase_range,
        builds: builds
      });
    });

    const nukesReady: Build[] = await this.pool.query(getFinishedNukesOrdersQuery, [nextTurnId, countryId])
      .then((result: QueryResult) =>  result.rows.map((node: BuildLocationResult) => {
        return <Build>{
          typeId: 5,
          buildType: BuildType.NUKE_FINISH,
          nodeId: node.node_id,
          nodeName: node.node_name,
          loc: node.loc,
          provinceName: node.province_name
        };
      }));

    buildOrders[0].nukesReady = nukesReady;

    return buildOrders;
  }

  resolveBuildType(buildTypeId: number): BuildType {
    switch(buildTypeId) {
      case -3: return BuildType.NUKE_START
      case -2: return BuildType.RANGE;
      case -1: return BuildType.DISBAND;
      case  0: return BuildType.BUILD;
      case  1: return BuildType.ARMY;
      case  2: return BuildType.FLEET;
      case  3: return BuildType.WING;
      case  4: return BuildType.NUKE_RUSH;
      case  5: return BuildType.NUKE_FINISH;
      default: return BuildType.BUILD;
    }
  }

  async getDisbandOrders(currentTurnId: number, nextTurnId: number, countryId: number): Promise<DisbandOrders> {
    const disbandOrders: DisbandOrders[] = await this.pool.query(getDisbandOrdersQuery, [currentTurnId, nextTurnId, countryId])
      .then((result: QueryResult) => result.rows.map((orderSet: DisbandOrdersResult) => {
        return <DisbandOrders> {
          countryId: orderSet.country_id,
          countryName: orderSet.country_name,
          bankedBuilds: orderSet.banked_builds,
          disbands: orderSet.disbands,
          unitsDisbanding: orderSet.units_disbanding,
          nukeLocs: orderSet.nuke_locs,
          unitDisbandingDetailed: orderSet.unit_disbanding_detailed.map((unit: DisbandingUnitDetailResult, index: number) => {
            return <DisbandingUnitDetail> {
              unitId: unit.unit_id,
              unitType: unit.unit_type,
              provinceName: unit.province_name,
              loc: unit.loc
            }
          }),
          nukeRange: orderSet.nuke_range,
          increaseRange: orderSet.increase_range
        }
      }));

    return disbandOrders[0];
  }

  async getCountryOrderSets(
    gameId: number,
    turnId: number,
    countryId: number
  ): Promise<CountryOrderSet[]> {
    return await this.pool.query(getCountryOrderSets, [gameId, turnId, countryId])
      .then((result: QueryResult) => result.rows.map((orderSet: CountryOrderSetsResult) => {
        return <CountryOrderSet> {
          orderSetId: orderSet.order_set_id,
          turnStatus: orderSet.turn_status,
          turnType: orderSet.turn_type,
          adjustments: orderSet.adjustments,
          inRetreat: orderSet.in_retreat
        }
      }));
  }

  async saveUnitOrder(orderSetId: number, unit: Order): Promise<void> {
    await this.pool.query(saveUnitOrderQuery, [
      unit.orderType,
      unit.secondaryUnitId,
      unit.destinationId,
      'Submitted',
      orderSetId,
      unit.orderedUnitId
    ]);
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

    await this.pool.query(saveTransferOrdersQuery, [
      techTransfer.techPartnerId,
      buildRecipients,
      tupleizedBuildRecipients,
      orderSetId
    ])
    .catch((error: Error) => console.log('saveTransfers error: ' + error.message));
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

    await this.pool.query(saveBuildOrdersQuery, [
      buildLocs,
      buildLocsTupleized,
      nukeLocs,
      builds.increaseRange,
      orderSetId
    ]);
  }

  async saveDisbandOrders(orderSetId: number, disbands: DisbandOrders): Promise<void> {
    await this.pool.query(saveDisbandOrdersQuery, [
      disbands.unitsDisbanding,
      disbands.increaseRange,
      disbands.nukeLocs,
      orderSetId
    ]);
  }

  async getNukesReadyLocs(nextTurnId: number, countryId:  number): Promise<NukeBuildInDisband[]> {
    return await this.pool.query(getFinishedNukesOrdersQuery, [nextTurnId, countryId])
      .then((result: QueryResult) =>  result.rows.map((loc: BuildLocationResult, index: number) => {
        return <NukeBuildInDisband>{
          unitId: index * -1,
          nodeId: loc.node_id,
          province: loc.province_name,
          display: loc.province_name,
          loc: loc.loc
        };
      }));
  }

  async getNominationOrder(turnId: number, countryId: number): Promise<NominatableCountry[]> {
    return await this.pool.query(getNominationOrderQuery, [turnId, countryId])
      .then((result: QueryResult) => result.rows.map((country: NominatableCountryResult) => {
        return <NominatableCountry> {
          countryId: country.country_id,
          countryName: country.country_name,
          rank: country.rank
        };
      }));
  }

  async saveNominationOrder(orderSetId: number, nomination: number[]): Promise<void> {
    await this.pool.query(saveNominationQuery, [nomination, orderSetId]);
  }

  async getVotes(turnId: number, countryId: number): Promise<number[]> {
    return await this.pool.query(getVotesOrdersQuery, [turnId, countryId])
      .then((result: QueryResult) => result.rows[0].votes ? result.rows[0].votes : []);
  }

  async saveVotes(orderSetId: number, votes: number[]): Promise<void> {
    await this.pool.query(saveVotesQuery, [votes, orderSetId]);
  }
};