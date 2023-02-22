import { Pool, QueryResult } from "pg";
import { IDatabase, IMain } from "pg-promise";
import { UnitOrderResolution, UnitOrderResolutionResult } from "../../models/objects/resolution/order-resolution-objects";
import { victorCredentials } from "../../secrets/dbCredentials";
import { getUnitOrdersForResolutionQuery } from "../queries/resolution/get-unit-orders-for-resolution-query";

export class ResolutionRepository {
  pool = new Pool(victorCredentials);

  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async getUnitOrdersForResolution(currentTurnId: number, orderTurnId: number): Promise<UnitOrderResolution[]> {
    return await this.pool.query(getUnitOrdersForResolutionQuery, [currentTurnId, orderTurnId])
      .then((result: QueryResult<any>) => result.rows.map((order: UnitOrderResolutionResult) => {
        return <UnitOrderResolution> {
          orderId: order.order_id,
          orderType: order.order_type,
          orderedUnitId: order.ordered_unit_id,
          unitType: order.unit_type,
          unitStatus: order.unit_status,
          unitCountryId: order.country_id,
          unitCountry: order.country,
          nodeId: order.node_id,
          province: order.province,
          secondaryUnitId: order.secondary_unit_id,
          secondaryCountryId: order.secondary_country_id,
          secondaryCountry: order.secondary_country,
          destinationId: order.destination_id,
          orderSuccess: order.order_success,
          power: order.power,
          description: order.description,
          primaryResolution: order.primary_resolution,
          secondaryResolution: order.secondary_resolution
        }
      }));
  }
}