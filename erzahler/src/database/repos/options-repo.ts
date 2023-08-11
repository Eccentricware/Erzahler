import { Pool, QueryResult } from 'pg';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import {
  AdjacenctMovement,
  AdjacenctMovementResult,
  AirAdjacency,
  AtRiskUnit,
  AtRiskUnitResult,
  BuildLoc,
  BuildLocResult,
  DestinationResult,
  NominatableCountry,
  NominatableCountryResult,
  Nomination,
  NominationResult,
  OrderOption,
  SavedDestination,
  SavedOption,
  SavedOptionResult,
  TransferCountry,
  TransferCountryResult,
  TransferOption,
  TransferOptionResult,
  UnitAdjacyInfoResult,
  UnitOptions
} from '../../models/objects/option-context-objects';
import { BuildLocationResult } from '../../models/objects/order-objects';
import { envCredentials } from '../../secrets/dbCredentials';
import { getAirAdjQuery } from '../queries/orders/get-air-adj-query';
import { getAtRiskUnitsQuery } from '../queries/orders/get-at-risk-units-query';
import { getEmptySupplyCentersQuery } from '../queries/orders/get-empty-supply-centers-query';
import { getNominatableCountriesQuery } from '../queries/orders/get-nominatable-countries-query';
import { getOrderOptionsQuery } from '../queries/orders/get-order-options-query';
import { getTransferBuildOptionsQuery } from '../queries/orders/get-transfer-build-options-query';
import { getTransferOptionsQuery } from '../queries/orders/get-transfer-options-query';
import { getTechOfferOptionsQuery } from '../queries/orders/get-transfer-tech-offer-options-query';
import { getTechReceiveOptionsQuery } from '../queries/orders/get-transfer-tech-receive-options-query';
import { getUnitAdjacentInfoQuery } from '../queries/orders/get-unit-adjacent-info-query';
import { getActiveCountryCenters } from '../queries/orders/options-final/get-active-centers-query';
import { getNominationsQuery } from '../queries/orders/options-final/get-nominations-query';
import { terminalLog } from '../../server/utils/general';

export class OptionsRepository {
  orderOptionsCols: ColumnSet<unknown>;
  pool: Pool = new Pool(envCredentials);
  /**
   * @param db
   * @param pgp
   */
  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.orderOptionsCols = new pgp.helpers.ColumnSet(
      ['unit_id', 'order_type', 'secondary_unit_id', 'secondary_order_type', 'destinations', 'turn_id'],
      { table: 'order_options' }
    );
  }

  //// Legacy Functions ////

  async getUnitAdjacencyInfo(gameId: number, turnNumber: number): Promise<UnitOptions[]> {
    const unitAdjacencyInfoResult: UnitOptions[] = await this.pool
      .query(getUnitAdjacentInfoQuery, [gameId, turnNumber])
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
            adjacencies: result.adjacencies.map((adjacency) => {
              return {
                nodeId: adjacency.node_id,
                provinceId: adjacency.province_id,
                provinceName: adjacency.province_name
              };
            }),
            moveTransported: [],
            holdSupports:
              result.hold_supports &&
              result.hold_supports.map((unit) => {
                return { unitId: unit.unit_id, unitName: unit.unit_name };
              }),
            moveSupports: {},
            transportSupports: {},
            nukeTargets: [],
            adjacentTransports:
              result.adjacent_transports &&
              result.adjacent_transports.map((unit) => {
                return { unitId: unit.unit_id, unitName: unit.unit_name };
              }),
            allTransports: {},
            nukeRange: result.nuke_range,
            adjacentTransportables:
              result.adjacent_transportables &&
              result.adjacent_transportables.map((unit) => {
                return { unitId: unit.unit_id, unitName: unit.unit_name };
              }),
            transportDestinations:
              result.transport_destinations &&
              result.transport_destinations.map((destination) => {
                return {
                  nodeId: destination.node_id,
                  nodeName: destination.node_name,
                  provinceId: destination.province_id
                };
              })
          };
        });
      })
      .catch((error: Error) => {
        terminalLog('unitAdjacencyInfoResultError: ' + error.message);
        const dud: UnitOptions[] = [];
        return dud;
      });

    return unitAdjacencyInfoResult;
  }

  async getAirAdjacencies(gameId: number): Promise<AirAdjacency[]> {
    const airAdjArray: AirAdjacency[] = await this.pool
      .query(getAirAdjQuery, [gameId])
      .then((results: QueryResult<any>) => {
        return results.rows.map((result: any) => {
          return <AirAdjacency>{
            nodeId: result.node_id,
            adjacencies: result.adjacencies.map((adjacency: AdjacenctMovementResult) => {
              return <AdjacenctMovement>{
                nodeId: adjacency.node_id,
                provinceId: adjacency.province_id,
                provinceName: adjacency.province_name
              };
            }),
            provinceName: result.province_name
          };
        });
      });

    return airAdjArray;
  }

  async saveUnitOptions(unitOptions: OrderOption[], turnId: number): Promise<void> {
    const optionsValues = unitOptions.map((option) => {
      return {
        unit_id: option.unitId,
        order_type: option.orderType,
        secondary_unit_id: option.secondaryUnitId,
        secondary_order_type: option.secondaryOrderType,
        destinations: option.destinations,
        turn_id: turnId
      };
    });

    const query = this.pgp.helpers.insert(optionsValues, this.orderOptionsCols);
    await this.pool.query(query);
  }

  /**
   * Fetches options for a turn
   * @param turnId    - Turn's ID
   * @returns Promise<SavedOption[]>
   */
  async getUnitOptions(
    gameId: number,
    turnNumber: number,
    ordersTurnId: number,
    countryId = 0
  ): Promise<SavedOption[]> {
    const savedOptions: SavedOption[] = await this.pool
      .query(getOrderOptionsQuery, [gameId, turnNumber, ordersTurnId, countryId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((result: SavedOptionResult) => {
          return <SavedOption>{
            unitId: result.unit_id,
            unitType: result.unit_type,
            unitCountryId: result.unit_country_id,
            unitCountryName: result.unit_country_name,
            unitCountryRank: result.unit_country_rank,
            unitFlagKey: result.unit_flag_key,
            provinceName: result.province_name,
            nodeId: result.node_id,
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
            destinations:
              result.destinations[0] !== null
                ? result.destinations.map((destination: DestinationResult) => {
                    return <SavedDestination>{
                      nodeId: destination.node_id,
                      nodeName: this.formatDestinationNodeName(destination.node_name),
                      nodeDisplay: destination.node_display,
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
    const transferOptions: TransferCountry[] = await this.pool
      .query(getTransferBuildOptionsQuery, [gameId, turnId])
      .then((result: QueryResult<any>) =>
        result.rows.map((countryResult: TransferCountryResult) => {
          return <TransferCountry>{
            countryId: countryResult.country_id,
            countryName: countryResult.country_name
          };
        })
      );

    return transferOptions;
  }

  async getTechOfferOptions(gameId: number, turnId: number): Promise<TransferCountry[]> {
    const transferOptions: TransferCountry[] = await this.pool
      .query(getTechOfferOptionsQuery, [gameId, turnId])
      .then((result: QueryResult<any>) =>
        result.rows.map((countryResult: TransferCountryResult) => {
          return <TransferCountry>{
            countryId: countryResult.country_id,
            countryName: countryResult.country_name
          };
        })
      );

    return transferOptions;
  }

  async getTechReceiveOptions(gameId: number, turnId: number): Promise<TransferCountry[]> {
    const transferOptions: TransferCountry[] = await this.pool
      .query(getTechReceiveOptionsQuery, [gameId, turnId])
      .then((result: QueryResult<any>) =>
        result.rows.map((countryResult: TransferCountryResult) => {
          return <TransferCountry>{
            countryId: countryResult.country_id,
            countryName: countryResult.country_name
          };
        })
      );

    return transferOptions;
  }

  async getTransferOptions(gameId: number, turnId: number): Promise<TransferOption[]> {
    const transferOptions: TransferOption[] = await this.pool
      .query(getTransferOptionsQuery, [gameId, turnId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((game: TransferOptionResult) => {
          return <TransferOption>{
            gameId: game.game_id,
            giveTech: game.give_tech.map((country: TransferCountryResult) => {
              return <TransferCountry>{
                countryId: country.country_id,
                countryName: country.country_name
              };
            }),
            receiveTech: game.receive_tech.map((country: TransferCountryResult) => {
              return <TransferCountry>{
                countryId: country.country_id,
                countryName: country.country_name
              };
            }),
            receiveBuilds: game.receive_builds.map((country: TransferCountryResult) => {
              return <TransferCountry>{
                countryId: country.country_id,
                countryName: country.country_name
              };
            })
          };
        });
      })
      .catch((error: Error) => {
        terminalLog('getTransferOptions Error: ' + error.message);
        return [];
      });

    return transferOptions;
  }

  async getAvailableBuildLocs(turnNumber: number, gameId: number, countryId = 0): Promise<BuildLocResult[]> {
    const buildLocs: BuildLocResult[] = await this.pool
      .query(getEmptySupplyCentersQuery, [gameId, turnNumber, countryId])
      .then((result: QueryResult<any>) =>
        result.rows.map((province: BuildLocResult) => {
          return <BuildLocResult>{
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
        })
      )
      .catch((error: Error) => {
        terminalLog('getAvailableBuildLocs Error: ' + error.message);
        return [];
      });

    return buildLocs;
  }

  async getAtRiskUnits(gameId: number, turnNumber: number, countryId: number): Promise<AtRiskUnit[]> {
    const atRiskUnits: AtRiskUnit[] = await this.pool
      .query(getAtRiskUnitsQuery, [gameId, turnNumber, countryId])
      .then((result: QueryResult<any>) =>
        result.rows.map((unit: AtRiskUnitResult) => {
          return <AtRiskUnit>{
            unitId: unit.unit_id,
            unitType: unit.unit_type,
            loc: unit.loc,
            provinceName: unit.province_name
          };
        })
      )
      .catch((error: Error) => {
        terminalLog('getAtRiskUnits Error: ' + error.message);
        return [];
      });

    return atRiskUnits;
  }

  async getNominatableCountries(gameId: number, turnNumber: number): Promise<NominatableCountry[]> {
    const nominatableCountries: NominatableCountry[] = await this.pool
      .query(getNominatableCountriesQuery, [gameId, turnNumber])
      .then((result: QueryResult) =>
        result.rows.map((country: NominatableCountryResult) => {
          return <NominatableCountry>{
            countryId: country.country_id,
            countryName: country.country_name,
            rank: country.rank
          };
        })
      )
      .catch((error: Error) => {
        terminalLog('getNominatableCountries Error: ' + error.message);
        return [];
      });

    return nominatableCountries;
  }

  async getNominations(turnId: number): Promise<Nomination[]> {
    const nominations: Nomination[] = await this.pool
      .query(getNominationsQuery, [turnId])
      .then((result: QueryResult<any>) =>
        result.rows.map((nomination: NominationResult) => {
          return <Nomination>{
            nominationId: nomination.nomination_id,
            signature: nomination.signature,
            countries: nomination.countries.map((country: NominatableCountryResult) => {
              return <NominatableCountry>{
                countryId: country.country_id,
                countryName: country.country_name,
                rank: country.rank
              };
            }),
            votesRequired: nomination.votes_required
          };
        })
      )
      .catch((error: Error) => {
        terminalLog('getNominations Error: ' + error.message);
        return [];
      });

    return nominations;
  }

  formatDestinationNodeName(nodeName: string): string {
    const nameSplit: string[] = nodeName.toUpperCase().split('_');
    return nameSplit.length === 3 ? nameSplit[0] + nameSplit[2] : nameSplit[0];
  }

  async getActiveCountryCenters(gameId: number, turnNumber: number, countryId: number): Promise<BuildLoc[]> {
    return await this.pool.query(getActiveCountryCenters, [gameId, turnNumber, countryId]).then((result: QueryResult) =>
      result.rows.map((loc: BuildLocationResult) => {
        return <BuildLoc>{
          nodeId: loc.node_id,
          loc: loc.loc,
          province: loc.province_name,
          display: loc.province_name
        };
      })
    );
  }

  // async getVoteOptions(turnId: number): Promise<Nomination[]> {
  //   const coalitions: Nomination[] = await this.pool.query(getNominationsQuery, [turnId])
  //     .then((result: QueryResult) => result.rows.map((coalition: NominationResult) => {

  //     }));
  // }
}
