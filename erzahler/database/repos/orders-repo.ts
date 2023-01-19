import { error } from "console";
import { Pool, QueryResult } from "pg";
import { ColumnSet, IDatabase, IMain, queryResult } from "pg-promise";
import { BuildType, UnitType } from "../../models/enumeration/unit-enum";
import { AdjacenctMovement, AdjacenctMovementResult, AirAdjacency, AtRiskUnit, AtRiskUnitResult, BuildLoc, BuildLocResult, DestinationResult, NominatableCountry, NominatableCountryResult, Nomination, NominationResult, Order, OrderOption, OrderResult, OrderSet, OrderSetResult, SavedDestination, SavedOption, SavedOptionResult, TransferCountry, TransferCountryResult, TransferOption, TransferOptionResult, UnitAdjacyInfoResult, UnitOptions } from "../../models/objects/option-context-objects";
import { TransferBuildsCountry, TransferTechCountry } from "../../models/objects/options-objects";
import { TransferBuildOrder, TransferBuildOrdersResults, TransferTechOrder, TransferTechOrderResult, BuildOrders, BuildOrdersResult, BuildLocationResult, Build } from "../../models/objects/order-objects";
import { CountryOrderSet, CountryOrderSetsResult } from "../../models/objects/orders/expected-order-types-object";
import { victorCredentials } from "../../secrets/dbCredentials";
import { getAirAdjQuery } from "../queries/orders/get-air-adj-query";
import { getAtRiskUnitsQuery } from "../queries/orders/get-at-risk-units-query";
import { getEmptySupplyCentersQuery } from "../queries/orders/get-empty-supply-centers-query";
import { getNominatableCountriesQuery } from "../queries/orders/get-nominatable-countries-query";
import { getNominationsQuery } from "../queries/orders/get-nominations-query";
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
import { getTechTransferOrderQuery } from "../queries/orders/orders-final/get-tech-transfer-order-query";
import { saveTransferOrdersQuery } from "../queries/orders/orders-final/save-transfer-orders-query";
import { saveUnitOrderQuery } from "../queries/orders/orders-final/save-unit-order-query";
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

  async saveOrderOptions(orderOptions: OrderOption[], turnId: number): Promise<void> {
    const orderOptionValues = orderOptions.map((option: OrderOption) => {
      return {
        unit_id: option.unitId,
        order_type: option.orderType,
        secondary_unit_id: option.secondaryUnitId,
        secondary_order_type: option.secondaryOrderType,
        destinations: option.destinations,
        turn_id: turnId
      }
    });

    const query = this.pgp.helpers.insert(orderOptionValues, this.orderOptionsCols);
    return this.db.query(query);
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

  async getUnitAdjacencyInfo(gameId: number, turnId: number): Promise<UnitOptions[]> {
    const unitAdjacencyInfoResult: UnitOptions[] = await this.pool.query(getUnitAdjacentInfoQuery, [gameId, turnId])
      .then((results: QueryResult<any>) => {
        return results.rows.map((result: UnitAdjacyInfoResult) => {
          return <UnitOptions>{
            unitId: result.unit_id,
            unitName: result.unit_name,
            unitType: result.unit_type,
            nodeId: result.node_id,
            nodeName: result.node_name,
            provinceId: result.province_id,
            provinceName: result.province_name,
            adjacencies: result.adjacencies.map((adjacency) => { return {
              nodeId: adjacency.node_id,
              provinceId: adjacency.province_id,
              provinceName: adjacency.province_name
            }}),
            moveTransported: [],
            holdSupports: result.hold_supports && result.hold_supports.map((unit) => { return { unitId: unit.unit_id, unitName: unit.unit_name }}),
            moveSupports: {},
            transportSupports: {},
            nukeTargets: [],
            adjacentTransports: result.adjacent_transports && result.adjacent_transports.map((unit) => { return { unitId: unit.unit_id, unitName: unit.unit_name }}),
            allTransports: {},
            nukeRange: result.nuke_range,
            adjacentTransportables: result.adjacent_transportables && result.adjacent_transportables.map((unit) => { return { unitId: unit.unit_id, unitName: unit.unit_name }}),
            transportDestinations: result.transport_destinations && result.transport_destinations.map((destination) => {
              return {
                nodeId: destination.node_id,
                nodeName: destination.node_name,
                provinceId: destination.province_id
              }
            })
          }
        })
      })
      .catch((error: Error) => {
        console.log('unitAdjacencyInfoResultError: ' + error.message);
        const dud: UnitOptions[] = []
        return dud;
      });

    return unitAdjacencyInfoResult;
  }



  async getAirAdjacencies(gameId: number): Promise<AirAdjacency[]> {
    const airAdjArray: AirAdjacency[] = await this.pool.query(getAirAdjQuery, [gameId])
      .then((results: QueryResult<any>) => {
        return results.rows.map((result: any) => {
          return <AirAdjacency>{
            nodeId: result.node_id,
            adjacencies: result.adjacencies.map((adjacency: AdjacenctMovementResult) => {
              return <AdjacenctMovement>{
                nodeId: adjacency.node_id,
                provinceId: adjacency.province_id,
                provinceName: adjacency.province_name
              }
            }),
            provinceName: result.province_name
          }
        });
      });

    return airAdjArray;
  }

  /**
   * Fetches options for a turn
   * @param turnId    - Turn's ID
   * @returns Promise<SavedOption[]>
   */
  async getUnitOptions(turnTurnId: number, orderTurnId: number, countryId: number = 0): Promise<SavedOption[]> {
    const savedOptions: SavedOption[] = await this.pool.query(getOrderOptionsQuery, [turnTurnId, orderTurnId, countryId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((result: SavedOptionResult) => {
          return <SavedOption> {
            unitId: result.unit_id,
            unitType: result.unit_type,
            unitCountryId: result.unit_country_id,
            unitCountryName: result.unit_country_name,
            unitCountryRank: result.unit_country_rank,
            unitFlagKey: result.unit_flag_key,
            provinceName: result.province_name,
            unitLoc: result.unit_loc,
            canHold: result.can_hold,
            orderType: result.order_type,
            secondaryUnitId: result.secondary_unit_id,
            secondaryUnitType: result.secondary_unit_type,
            secondaryUnitCountryName: result.secondary_unit_country_name,
            secondaryUnitFlagKey: result.secondary_unit_flag_key,
            secondaryProvinceName: result.secondary_province_name,
            secondaryUnitLoc: result.secondary_unit_loc,
            secondaryOrderType: result.secondary_order_type,
            destinations: result.destinations[0] !== null
              ? result.destinations.map((destination: DestinationResult) => {
                return <SavedDestination> {
                  nodeId: destination.node_id,
                  nodeName: this.formatDestinationNodeName(destination.node_name),
                  loc: destination.loc
                };
              })
              : undefined
          };
        });
      });

    return savedOptions;
  }

  async getBuildTransferOptions(gameId: number, turnId: number): Promise<TransferCountry[]> {
    const transferOptions: TransferCountry[] = await this.pool.query(getTransferBuildOptionsQuery, [gameId, turnId])
      .then((result: QueryResult<any>) => result.rows.map((countryResult: TransferCountryResult) => {
        return <TransferCountry> {
          countryId: countryResult.country_id,
          countryName: countryResult.country_name
        };
      }))

    return transferOptions;
  }

  async getTechOfferOptions(gameId: number, turnId: number): Promise<TransferCountry[]> {
    const transferOptions: TransferCountry[] = await this.pool.query(getTechOfferOptionsQuery, [gameId, turnId])
      .then((result: QueryResult<any>) => result.rows.map((countryResult: TransferCountryResult) => {
        return <TransferCountry> {
          countryId: countryResult.country_id,
          countryName: countryResult.country_name
        };
      }))

    return transferOptions;
  }

  async getTechReceiveOptions(gameId: number, turnId: number): Promise<TransferCountry[]> {
    const transferOptions: TransferCountry[] = await this.pool.query(getTechReceiveOptionsQuery, [gameId, turnId])
      .then((result: QueryResult<any>) => result.rows.map((countryResult: TransferCountryResult) => {
        return <TransferCountry> {
          countryId: countryResult.country_id,
          countryName: countryResult.country_name
        };
      }))

    return transferOptions;
  }

  async getTransferOptions(gameId: number, turnId: number): Promise<TransferOption[]> {
    const transferOptions: TransferOption[] = await this.pool.query(getTransferOptionsQuery, [gameId, turnId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((game: TransferOptionResult) => {
          return <TransferOption> {
            gameId: game.game_id,
            giveTech: game.give_tech.map((country: TransferCountryResult) => {
              return <TransferCountry> {
                countryId: country.country_id,
                countryName: country.country_name
              }
            }),
            receiveTech: game.receive_tech.map((country: TransferCountryResult) => {
              return <TransferCountry> {
                countryId: country.country_id,
                countryName: country.country_name
              }
            }),
            receiveBuilds: game.receive_builds.map((country: TransferCountryResult) => {
              return <TransferCountry> {
                countryId: country.country_id,
                countryName: country.country_name
              }
            })
          }
        })
      })
      .catch((error: Error) => {
        console.log('getTransferOptions Error: ' + error.message);
        return [];
      });

    return transferOptions;
  }

  async getAvailableBuildLocs(gameId: number, turnId: number, countryId: number = 0): Promise<BuildLocResult[]> {
    const buildLocs: BuildLocResult[] = await this.pool.query(getEmptySupplyCentersQuery, [gameId, turnId, countryId])
      .then((result: QueryResult<any>) => result.rows.map((province: BuildLocResult) => {
        return <BuildLocResult> {
          countryId: province.country_id,
          countryName: province.country_name,
          provinceName: province.province_name,
          cityLoc: province.city_loc,
          landNodeId: province.land_node_id,
          landNodeLoc: province.land_node_loc,
          seaNodeId: province.sea_node_id,
          seaNodeLoc: province.sea_node_loc,
          seaNodeName: province.sea_node_name,
          airNodeId: province.air_node_id,
          airNodeLoc: province.air_node_loc
        };
      }))
      .catch((error: Error) => {
        console.log('getAvailableBuildLocs Error: ' + error.message);
        return [];
      });

    return buildLocs;
  }

  async getAtRiskUnits(turnId: number, countryId: number = 0): Promise<AtRiskUnit[]> {
    const atRiskUnits: AtRiskUnit[] = await this.pool.query(getAtRiskUnitsQuery, [turnId, countryId])
      .then((result: QueryResult<any>) => result.rows.map((unit: AtRiskUnitResult) => {
        return <AtRiskUnit> {
          unitId: unit.unit_id,
          unitType: unit.unit_type,
          loc: unit.loc,
          countryId: unit.country_id,
          countryName: unit.country_name,
          rank: unit.rank,
          flagKey: unit.flag_key
        }
      }))
      .catch((error: Error) => {
        console.log('getAtRiskUnits Error: ' + error.message);
        return [];
      });

      return atRiskUnits;
  }

  async getNominatableCountries(turnId: number): Promise<NominatableCountry[]> {
    const nominatableCountries: NominatableCountry[]
      = await this.pool.query(getNominatableCountriesQuery, [turnId])
        .then((result: QueryResult) => result.rows.map((country: NominatableCountryResult) => {
          return <NominatableCountry> {
            countryId: country.country_id,
            countryName: country.country_name,
            rank: country.rank
          };
        }))
        .catch((error: Error) => {
          console.log('getNominatableCountries Error: ' + error.message);
          return [];
        });

    return nominatableCountries;
  }

  async getNominations(turnId: number): Promise<Nomination[]> {
    const nominations: Nomination[] = await this.pool.query(getNominationsQuery, [turnId])
      .then((result: QueryResult<any>) => result.rows.map((nomination: NominationResult) => {
        return <Nomination> {
          nominationId: nomination.nomination_id,
          rankSignature: nomination.rank_signature,
          countries: nomination.countries.map((country: NominatableCountryResult) => {
            return <NominatableCountry> {
              countryId: country.country_id,
              countryName: country.country_name,
              rank: country.rank
            };
          }),
          votesRequired: nomination.votes_required
        };
      }))
      .catch((error: Error) => {
        console.log('getNominations Error: ' + error.message);
        return [];
      });

    return nominations;
  }

  formatDestinationNodeName(nodeName: string): string {
    const nameSplit: string[] = nodeName.toUpperCase().split('_');
    return nameSplit.length === 3 ? nameSplit[0] + nameSplit[2] : nameSplit[0];
  }

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
          orderedUnitLoc: orderResult.ordered_unit_loc,
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
            countryId: recipient.country_id,
            countryName: recipient.country_name,
            builds: tuples[index + 1]
          });
        }
      }
    });

    return transferBuildOrders;
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

  async getBuildOrders(nextTurnId: number, currentTurnId: number, countryId: number): Promise<BuildOrders[]> {
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

      const nukes: Build[] = [];
      if (result.build_tuples?.length > 0) {
        const nukeTuples: number[] = result.nuke_tuples;
        const nukeLocs: BuildLocationResult[] = result.nuke_locs;

        for (let index = 0; index < nukeTuples.length; index += 2) {
          const nukeLoc = nukeLocs.find((loc: BuildLocationResult) => loc.node_id === nukeTuples[index]);
          const buildTypeId = nukeTuples[index + 1];
          let buildType = this.resolveBuildType(buildTypeId);

          nukes.push({
            typeId: buildTypeId,
            buildType: buildType,
            nodeId: nukeLoc ? nukeLoc.node_id : 0,
            nodeName: nukeLoc ? nukeLoc.node_name : '',
            provinceName: nukeLoc ? nukeLoc.province_name : '',
            loc: nukeLoc ? nukeLoc.loc : [0,0]
          });
        }
      }

      buildOrders.push({
        countryId: result.country_id,
        countryName: result.country_name,
        bankedBuilds: result.banked_builds,
        buildCount: result.builds,
        nukeRange: result.nuke_range,
        increaseRange: result.increase_range,
        builds: builds,
        nukesReady: nukes
      });
    })

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
};