import { Pool, QueryResult } from 'pg';
import { IDatabase, IMain } from 'pg-promise';
import { envCredentials } from '../../secrets/dbCredentials';
import {
  HistoricBuild,
  HistoricBuildOrders,
  HistoricBuildOrdersResult,
  HistoricBuildResult,
  HistoricCountry,
  HistoricCountryOrders,
  HistoricCountryOrdersResult,
  HistoricNominatedCountryResult,
  HistoricNomination,
  HistoricNominationResult,
  HistoricNominationVote,
  HistoricNominationVoteResult,
  HistoricOrder,
  HistoricOrderResult,
  HistoricTurn,
  HistoricTurnResult,
  HistoricYayVoteResult
} from '../../models/objects/history-objects';
import { getHistoricUnitOrdersQuery } from '../queries/history/get-historic-unit-orders-query';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { getHistoricTurnQuery } from '../queries/history/get-historic-turn-query';
import { NominationRow } from '../../models/objects/database-objects';
import { CountryVotesResult, NominatableCountryResult } from '../../models/objects/option-context-objects';
import { getHistoricNominationsQuery } from '../queries/history/get-nomination-history-query';
import { getHistoricVotesQuery } from '../queries/history/get-historic-votes-query';
import { Build, BuildOrders, BuildOrdersResult, BuildResult } from '../../models/objects/order-objects';
import { getHistoricBuildOrdersQuery } from '../queries/history/get-historic-build-orders-query';
import { BuildType } from '../../models/enumeration/unit-enum';

export class HistoryRepository {
  pool = new Pool(envCredentials);
  constructor(private db: IDatabase<unknown>, private pgp: IMain) {}

  async getHistoricTurn(gameId: number, turnNumber: number): Promise<HistoricTurn | undefined> {
    const detailedTurns: HistoricTurn[] = await this.pool
      .query(getHistoricTurnQuery, [gameId, turnNumber, turnNumber - 1])
      .then((result: QueryResult<HistoricTurnResult>) =>
        result.rows.map((turn: HistoricTurnResult) => {
          return <HistoricTurn>{
            gameId: turn.game_id,
            turnId: turn.turn_id,
            gameName: turn.game_name,
            turnName: turn.turn_name,
            turnNumber: turn.turn_number,
            turnType: turn.turn_type,
            turnStatus: turn.turn_status,
            yearNumber: turn.year_number,
            yearStylized: turn.year_stylized,
            deadline: turn.deadline,
            defaultsReady: turn.defaults_ready,
            hasCaptures: [TurnType.FALL_ORDERS, TurnType.FALL_RETREATS].includes(turn.turn_type),
            unitMovement: [
              TurnType.SPRING_ORDERS,
              TurnType.ORDERS_AND_VOTES,
              TurnType.SPRING_RETREATS,
              TurnType.FALL_ORDERS,
              TurnType.FALL_RETREATS
            ].includes(turn.turn_type),
            transfers: [TurnType.SPRING_ORDERS, TurnType.ORDERS_AND_VOTES].includes(turn.turn_type),
            adjustments: [TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(turn.turn_type),
            historicCountries: turn.historic_countries.map((country: HistoricCountryOrdersResult) =>
              (<HistoricCountryOrders>{
                countryId: country.country_id,
                countryName: country.country_name,
                rank: country.rank,
                flagKey: country.flag_key,
                username: country.username,
                history: {
                  start: {
                    cityCount: country.city_count_start,
                    unitCount: country.unit_count_start,
                    voteCount: country.vote_count_start,
                    bankedBuilds: country.banked_builds_start,
                    nukeRange: country.nuke_range_start,
                    adjustments: country.adjustments_start
                  },
                  result: {
                    cityCount: country.city_count_result,
                    unitCount: country.unit_count_result,
                    voteCount: country.vote_count_result,
                    bankedBuilds: country.banked_builds_result,
                    nukeRange: country.nuke_range_result,
                    adjustments: country.adjustments_result
                  }
                },
                orders: {
                  trades: {
                    tech: undefined,
                    builds: []
                  },
                  units: [],
                  adjustments: [],
                  buildsBanked: 0,
                  buildsStartingNukes: 0,
                  buildsIncreasingRange: 0,
                  bankedBuildsIncreasingRange: 0
                }
              })
            )
          };
        })
      );

    return detailedTurns[0];
  }

  async getHistoricUnitOrders(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    countryId: number
  ): Promise<HistoricOrder[]> {
    const orders: HistoricOrder[] = await this.pool
      .query(getHistoricUnitOrdersQuery, [gameId, turnNumber, orderTurnId, countryId])
      .then((result: QueryResult<HistoricOrderResult>) =>
        result.rows.map(
          (orderResult: HistoricOrderResult) =>
            <HistoricOrder>{
              // Order Fields
              orderId: orderResult.order_id,
              orderSetId: orderResult.order_set_id,
              orderedUnitId: orderResult.ordered_unit_id,
              loc: orderResult.ordered_unit_loc,
              orderType: orderResult.order_type,
              secondaryUnitId: orderResult.secondary_unit_id,
              secondaryUnitLoc: orderResult.secondary_unit_loc,
              destinationId: orderResult.destination_id,
              eventLoc: orderResult.event_loc,
              orderStatus: orderResult.order_status,
              // Historic Fields
              countryId: orderResult.country_id,
              unitType: orderResult.unit_type,
              originProvinceName: orderResult.origin_province_name,
              destinationProvinceName: orderResult.destination_province_name,
              secondaryUnitType: orderResult.secondary_unit_type,
              secondaryProvinceName: orderResult.secondary_province_name,
              primaryResolution: orderResult.primary_resolution,
              secondaryResolution: orderResult.secondary_resolution,
              secondaryUnitOrderType: orderResult.secondary_unit_order_type
            }
        )
      );

    return orders;
  }

  async getHistoricBuildOrders(
    gameId: number,
    turnNumber: number,
    orderTurnId: number,
    countryId: number
  ): Promise<HistoricBuildOrders[]> {
    return await this.pool
      .query(getHistoricBuildOrdersQuery, [gameId, turnNumber, orderTurnId, countryId])
      .then((result: QueryResult) =>
        result.rows.map((result: HistoricBuildOrdersResult) => {
          return <HistoricBuildOrders>{
            countryId: result.country_id,
            countryName: result.country_name,
            bankedBuilds: result.banked_builds,
            adjustmentCount: result.adjustments,
            nukeRange: result.nuke_range,
            increaseRange: result.increase_range,
            builds: result.builds
              ? result.builds.map((build: HistoricBuildResult) => {
                  let locDisplay: string | string[] | undefined;
                  if (!build.node_display) {
                    locDisplay = build.node_name?.toUpperCase().split('_');
                    if (locDisplay) {
                      locDisplay = locDisplay[2] ? `${locDisplay[0]} ${locDisplay[2]}` : locDisplay[0];
                    }
                  }

                  return <HistoricBuild>{
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

  async getNominationResults(gameId: number, turnNumber: number): Promise<HistoricNomination[]> {
    return await this.pool
      .query(getHistoricNominationsQuery, [gameId, turnNumber])
      .then((result: QueryResult<HistoricNominationResult>) =>
        result.rows.map((nomination: HistoricNominationResult) => ({
          nominationId: nomination.nomination_id,
          countries: nomination.countries.map((country: HistoricNominatedCountryResult) => ({
            countryId: country.country_id,
            countryName: country.country_name,
            rank: country.rank
          })),
          signature: nomination.signature,
          votesRequired: nomination.votes_required
        }))
      );
  }

  async getVoteResults(gameId: number, turnNumber: number): Promise<HistoricNominationVote[]> {
    return await this.pool
      .query(getHistoricVotesQuery, [gameId, turnNumber])
      .then((result: QueryResult<HistoricNominationVoteResult>) =>
        result.rows.map((vote: HistoricNominationVoteResult) => ({
          nominationId: vote.nomination_id,
          countries: vote.countries.map((country: HistoricNominatedCountryResult) => ({
            countryId: country.country_id,
            countryName: country.country_name,
            rank: country.rank
          })),
          signature: vote.signature,
          votesRequired: vote.votes_required,
          votesReceived: vote.votes_received,
          yayVotes: vote.yay_votes
            ? vote.yay_votes.map((yayVote: HistoricYayVoteResult) => ({
                countryId: yayVote.country_id,
                countryName: yayVote.country_name,
                votesControlled: yayVote.votes_controlled
              }))
            : [],
          winner: vote.winner
        }))
      );
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
}
