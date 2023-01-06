import { Pool, QueryResult } from "pg";
import { ColumnSet, IDatabase, IMain } from "pg-promise";
import { AdjacenctMovement, AdjacenctMovementResult, AirAdjacency, OrderOption, SavedOption, SavedOptionResult, UnitAdjacyInfoResult, UnitOptions } from "../../models/objects/option-context-objects";
import { victorCredentials } from "../../secrets/dbCredentials";
import { getAirAdjQuery } from "../queries/options/get-air-adj-query";
import { getOrderOptionsQuery } from "../queries/options/get-order-options-query";
import { getUnitAdjacentInfoQuery } from "../queries/options/get-unit-adjacent-info-query";

export class OptionsRepository {
  orderOptionsCols: ColumnSet<unknown>;
  pool: Pool = new Pool(victorCredentials);
  /**
   * @param db
   * @param pgp
   */
  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.orderOptionsCols = new pgp.helpers.ColumnSet([
      'unit_id',
      'order_type',
      'secondary_unit_id',
      'secondary_order_type',
      'destinations',
      'turn_id'
    ], { table: 'order_options' });
  }

  saveOrderOptions(orderOptions: OrderOption[], turnId: number): Promise<void> {
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

<<<<<<< HEAD

=======
  async saveOrderOptions(orderOptions: OrderOption[]): Promise<void> {
    const orderOptionValues = orderOptions.map((option: OrderOption) => {
      return {
        unit_id: option.unitId,
        order_type: option.orderType,
        secondary_unit_id: option.secondaryUnitId,
        secondary_order_type: option.secondaryOrderType,
        destinations: option.destinations,
        turn_id: option.turnId
      }
    });


    const bulkOrderOptionsQuery = this.pgp.helpers.insert(orderOptionValues, this.orderOptionsCols) + 'RETURNING unit_id, order_type';
    const results = await this.db.map(bulkOrderOptionsQuery, [], (result: any) => {
      return {
        unitId: result.unit_id,
        orderType: result.order_type
      };
    });
    console.log('Whoa kay', results);
  }
>>>>>>> main

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
  async getUnitOptions(turnId: number, orderTurnId: number): Promise<SavedOption[]> {
    const savedOptions: SavedOption[] = await this.pool.query(getOrderOptionsQuery, [turnId, orderTurnId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((result: SavedOptionResult) => {
          return <SavedOption> {
            unitId: result.unit_id,
            unitType: result.unit_type,
            unitCountryId: result.unit_country_id,
            unitCountryName: result.unit_country_name,
            unitCountryRank: result.unit_country_rank,
            unitCountryFlagKey: result.unit_country_flag_key,
            provinceName: result.province_name,
            canHold: result.can_hold,
            orderType: result.order_type,
            secondaryUnitId: result.secondary_unit_id,
            secondaryUnitType: result.secondary_unit_type,
            secondaryProvinceName: result.secondary_province_name,
            secondaryOrderType: result.secondary_order_type,
            destinations: result.destinations
          };
        });
      });

    return savedOptions;
  }
}