import { Pool, QueryResult } from 'pg';
import { IDatabase, IMain } from 'pg-promise';
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
  TransferResources,
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

export class ResolutionRepository {
  pool = new Pool(envCredentials);

  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  /**
   *
   * @param currentTurnId
   * @param orderTurnId
   * @returns
   */
  async getUnitOrdersForResolution(currentTurnId: number, orderTurnId: number): Promise<UnitOrderResolution[]> {
    return await this.pool
      .query(getUnitOrdersForResolutionQuery, [currentTurnId, orderTurnId])
      .then((result: QueryResult<any>) =>
        result.rows.map((order: UnitOrderResolutionResult) => {
          return <UnitOrderResolution>{
            orderId: order.order_id,
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
              voteType: order.vote_type,
              provinceStatus: order.province_status,
              controllerId: order.controller_id,
              capitalOwnerId: order.capital_owner_id
            },
            secondaryUnit: {
              id: order.secondary_unit_id,
              type: order.secondary_unit_type,
              countryId: order.secondary_country_id,
              country: order.secondary_country,
              canCapture: [UnitType.ARMY, UnitType.FLEET].includes(order.secondary_unit_type)
            },
            destination: {
              nodeId: order.destination_id,
              provinceId: order.destination_province_id,
              provinceName: order.destination_province_name,
              provinceType: order.destination_province_type,
              voteType: order.destination_vote_type,
              provinceStatus: order.destination_province_status,
              controllerId: order.destination_controller_id,
              capitalOwnerId: order.destination_capital_owner_id
            }
          };
        })
      )
      .catch((error: Error) => {
        console.log('Get Unit Orders For Resolution Error: ' + error.message);
        return [];
      });
  }

  /**
   * Returns potential transports, and destinations.
   * @param turnId
   * @returns
   */
  async getTransportNetworkInfo(turnId: number): Promise<TransportNetworkUnit[]> {
    const unitAdjacencyInfoResult: TransportNetworkUnit[] = await this.pool
      .query(getTransportNetworkValidation, [turnId])
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
        console.log('getTransportNetworkInfo: ' + error.message);
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
}
