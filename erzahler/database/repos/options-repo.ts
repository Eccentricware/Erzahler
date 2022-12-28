import { Pool, QueryResult } from "pg";
import { ColumnSet, IDatabase, IMain } from "pg-promise";
import { AdjacenctMovement, AdjacenctMovementResult, AirAdjacency, OrderOption, UnitAdjacyInfoResult, UnitOptions } from "../../models/objects/option-context-objects";
import { victorCredentials } from "../../secrets/dbCredentials";
import { getAirAdjQuery } from "../queries/options/get-air-adj-query";
import { getUnitAdjacentInfoQuery } from "../queries/options/get-unit-adjacent-info-query";

export class OptionsRepository {
  orderOptionsCols: ColumnSet<unknown>;

  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.orderOptionsCols = new pgp.helpers.ColumnSet([
        'unit_id',
        'order_type',
        'secondary_unit_id',
        'destination_choices',
        'turn_id'
      ],
      { table: 'order_options' }
    );
  }

  async getUnitAdjacencyInfo(gameId: number, turnId: number): Promise<UnitOptions[]> {
    const pool = new Pool(victorCredentials);

    const unitAdjacencyInfoResult: UnitOptions[] = await pool.query(getUnitAdjacentInfoQuery, [gameId, turnId])
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

  async saveOrderOptions(orderOptions: OrderOption[]): Promise<void> {
    const orderOptionValues = orderOptions.map((option: OrderOption) => {
      return {
        unit_id: option.unitId,
        order_type: option.orderType,
        secondary_unit_id: option.secondaryUnitId,
        destination_choices: option.destinationChoices,
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

  async getAirAdjacencies(gameId: number): Promise<AirAdjacency[]> {
    const pool = new Pool(victorCredentials);

    const airAdjArray: AirAdjacency[] = await pool.query(getAirAdjQuery, [gameId])
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
}