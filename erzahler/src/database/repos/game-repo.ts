import { Pool, Query, QueryResult } from 'pg';
import { IDatabase, IMain, ParameterizedQuery } from 'pg-promise';
import { GameDetailsBuilder } from '../../models/classes/game-details-builder';
import { GameSummaryBuilder } from '../../models/classes/game-summary-builder';
import { CountryRank, CountryStatus } from '../../models/enumeration/country-enum';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { GameSummaryQueryObject } from '../../models/objects/game-summary-query-object';
import { CoalitionSchedule, CoalitionScheduleResult } from '../../models/objects/games/coalition-schedule-objects';
import { CountryState, CountryStateResult } from '../../models/objects/games/country-state-objects';
import { CountryStats, CountryStatsResult } from '../../models/objects/games/country-stats-objects';
import { GameState, GameStateResult } from '../../models/objects/last-turn-info-object';
import { envCredentials } from '../../secrets/dbCredentials';
import { FormattingService } from '../../server/services/formatting-service';
import { checkGameNameAvailabilityQuery } from '../queries/game/check-game-name-availability-query';
import { checkUserGameAdminQuery } from '../queries/game/check-user-game-admin-query';
import { getCoalitionScheduleQuery } from '../queries/game/get-coalition-schedule-query';
import { getCountryStateQuery } from '../queries/game/get-country-state-query';
import { getGameDetailsQuery } from '../queries/game/get-game-details-query';
import { getGameStatsQuery } from '../queries/game/get-game-stats-query';
import { getGamesQuery } from '../queries/game/get-games-query';
import { getRulesInGameQuery } from '../queries/game/get-rules-in-game-query';
import { insertAssignmentQuery } from '../queries/game/insert-assignment-query';
import { insertCoalitionScheduleQuery } from '../queries/game/insert-coalition-schedule-query';
import { insertInitialCountryHistoryQuery } from '../queries/game/insert-initial-country-history-query';
import { insertCountryQuery } from '../queries/game/insert-country-query';
import { insertNewGameQuery } from '../queries/game/insert-game-query';
import { insertInitialProvinceHistoryQuery } from '../queries/game/insert-initial-province-history-query';
import { insertLabelLineQuery } from '../queries/game/insert-label-line-query';
import { insertLabelQuery } from '../queries/game/insert-label-query';
import { insertNodeAdjacencyQuery } from '../queries/game/insert-node-adjacency-query';
import { insertNodeQuery } from '../queries/game/insert-node-query';
import { insertProvinceQuery } from '../queries/game/insert-province-query';
import { insertRuleInGameQuery } from '../queries/game/insert-rule-in-game-query';
import { insertTerrainQuery } from '../queries/game/insert-terrain-query';
import { insertNextTurnQuery, insertTurnQuery } from '../queries/game/insert-turn-query';
import { insertInitialUnitHistoryQuery } from '../queries/game/insert-initial-unit-history-query';
import { insertUnitQuery } from '../queries/game/insert-unit-query';
import { updateGameSettingsQuery } from '../queries/game/update-game-settings-query';
import { updateTurnQuery } from '../queries/game/update-turn-query';
import { getGameStateQuery } from '../queries/orders/get-game-state-query';
import {
  CountryHistoryRow,
  CountryHistoryRowResult,
  ProvinceHistoryRow,
  ProvinceHistoryRowResult,
  UnitHistoryRow,
  UnitHistoryRowResult
} from '../schema/table-fields';
import { getCurrentCountryHistoriesQuery } from '../queries/isolated-tables/get-current-country-histories-query';
import { getCurrentUnitHistoriesQuery } from '../queries/isolated-tables/get-current-unit-histories-query';
import { getCurrentProvinceHistoryQuery } from '../queries/isolated-tables/get-current-province-histories-query';
import { GameFinderParameters } from '../../models/objects/games/game-finder-query-objects';
import { startGameQuery } from '../queries/game/start-game-query';
import { terminalLog } from '../../server/utils/general';
import { Turn, TurnResult } from '../../models/objects/database-objects';

const gamesCols: string[] = [
  'game_name',
  'game_status',
  'assignment_method',
  'stylized_start_year',
  'current_year',
  'turn_1_timing',
  'deadline_type',
  'start_time',
  'observe_dst',
  'orders_day',
  'orders_time',
  'retreats_day',
  'retreats_time',
  'adjustments_day',
  'adjustments_time',
  'nominations_day',
  'nominations_time',
  'votes_day',
  'votes_time',
  'nmr_tolerance_total',
  'concurrent_games_limit',
  'private_game',
  'hidden_game',
  'blind_administrators',
  'final_readiness_check',
  'vote_delay_enabled',
  'partial_roster_start',
  'nomination_timing',
  'nomination_year',
  'automatic_assignments',
  'rating_limits_enabled',
  'fun_min',
  'fun_max',
  'skill_min',
  'skill_max'
];
export class GameRepository {
  formattingService = new FormattingService();
  pool = new Pool(envCredentials);
  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async getGameState(gameId: number): Promise<any> {
    const gameState: GameState = await this.pool.query(getGameStateQuery, [gameId]).then((result: QueryResult<any>) => {
      return result.rows.map((gameStateResult: GameStateResult) => {
        return <GameState>{
          gameId: gameStateResult.game_id,
          gameName: gameStateResult.game_name,
          turnId: gameStateResult.turn_id,
          deadline: gameStateResult.deadline,
          turnNumber: gameStateResult.turn_number,
          turnName: gameStateResult.turn_name,
          turnType: gameStateResult.turn_type,
          turnStatus: gameStateResult.turn_status,
          resolvedTime: gameStateResult.resolved_time,
          pendingTurnId: gameStateResult.pending_turn_id,
          pendingTurnType: gameStateResult.pending_turn_type,
          preliminaryTurnId: gameStateResult.preliminary_turn_id,
          preliminaryTurnType: gameStateResult.preliminary_turn_type,
          ordersDay: gameStateResult.orders_day,
          ordersTime: gameStateResult.orders_time,
          ordersSpan: gameStateResult.orders_span,
          retreatsDay: gameStateResult.retreats_day,
          retreatsTime: gameStateResult.retreats_time,
          retreatsSpan: gameStateResult.retreats_span,
          adjustmentsDay: gameStateResult.adjustments_day,
          adjustmentsTime: gameStateResult.adjustments_time,
          adjustmentsSpan: gameStateResult.adjustments_span,
          nominationsDay: gameStateResult.nominations_day,
          nominationsTime: gameStateResult.nominations_time,
          nominationsSpan: gameStateResult.nominations_span,
          votesDay: gameStateResult.votes_day,
          votesTime: gameStateResult.votes_time,
          votesSpan: gameStateResult.votes_span,
          deadlineMissed: gameStateResult.deadline_missed,
          nominateDuringAdjustments: gameStateResult.nominate_during_adjustments,
          voteDuringSpring: gameStateResult.vote_during_spring,
          nominationTiming: gameStateResult.nomination_timing,
          nominationYear: gameStateResult.nomination_year,
          currentYear: gameStateResult.current_year,
          yearNumber: gameStateResult.year_number,
          stylizedStartYear: gameStateResult.stylized_start_year,
          highestRankedReq: gameStateResult.highest_ranked_req,
          votingSchedule: {
            baseFinal: gameStateResult.base_final,
            penalties: {
              a: gameStateResult.penalty_a,
              b: gameStateResult.penalty_b,
              c: gameStateResult.penalty_c,
              d: gameStateResult.penalty_d,
              e: gameStateResult.penalty_e,
              f: gameStateResult.penalty_f,
              g: gameStateResult.penalty_g
            }
          },
          allVotesControlled: gameStateResult.all_votes_controlled,
          unitsInRetreat: gameStateResult.unit_in_retreat,
          defaultNukeRange: gameStateResult.default_nuke_range
        };
      })[0];
    });

    return gameState;
  }

  async insertGame(settingsArray: any[]): Promise<any> {
    return this.pool.query(insertNewGameQuery, settingsArray);
  }

  async insertRulesInGame(rules: any, gameName: string): Promise<any[]> {
    return rules.map(async (rule: any) => {
      return await this.pool.query(insertRuleInGameQuery, [gameName, rule.key, rule.enabled]).catch((error: Error) => {
        terminalLog('Rule In Games Error:', error.message);
      });
    });
  }

  async insertCoalitionScheduleQuery(gameName: string): Promise<void> {
    await this.pool
      .query(insertCoalitionScheduleQuery, [
        50,
        1,
        undefined,
        9,
        6,
        3,
        1,
        0,
        undefined,
        undefined,
        undefined,
        'ABB',
        undefined,
        gameName
      ])
      .catch((error: Error) => {
        terminalLog('Add Coalition Error:', error.message);
      });
  }

  async insertAssignment(
    userId: number,
    countryId: number | undefined,
    assignmentType: string,
    gameName: string
  ): Promise<void> {
    await this.pool.query(insertAssignmentQuery, [userId, null, 'Creator', gameName]).catch((error: Error) => {
      terminalLog('New Assignment Error:', error.message);
    });
  }

  /**
   * First turn
   * @param turnArgs
   * @returns
   */
  async insertTurn(turnArgs: any[]): Promise<any> {
    return this.pool.query(insertTurnQuery, turnArgs);
  }

  async insertNextTurn(turnArgs: any[]): Promise<Turn> {
    const nextTurnQuery: ParameterizedQuery = new ParameterizedQuery({
      text: insertNextTurnQuery,
      values: turnArgs
    });

    return await this.db.one(nextTurnQuery)
      .then((nextTurnResult: TurnResult) => ({
        turnId: nextTurnResult.turn_id,
        gameId: nextTurnResult.game_id,
        turnNumber: nextTurnResult.turn_number,
        turnName: nextTurnResult.turn_name,
        turnType: nextTurnResult.turn_type,
        turnStatus: nextTurnResult.turn_status,
        yearNumber: nextTurnResult.year_number,
        deadline: nextTurnResult.deadline
      }));
  }

  async insertProvinces(provinces: any, gameName: string): Promise<any[]> {
    const provincePromises: Promise<any>[] = [];

    for (const provinceName in provinces) {
      provincePromises.push(
        this.pool
          .query(insertProvinceQuery, [
            provinces[provinceName].name,
            provinces[provinceName].fullName,
            provinces[provinceName].type,
            provinces[provinceName].cityType,
            provinces[provinceName].cityLoc,
            provinces[provinceName].country,
            gameName
          ])
          .catch((error: Error) => {
            terminalLog('Insert Province Error:', error.message);
          })
      );
    }

    return provincePromises;
  }

  async insertProvinceHistories(provinces: any, gameName: string): Promise<any[]> {
    const provinceHistoryPromises: Promise<any>[] = [];

    for (const provinceName in provinces) {
      provinceHistoryPromises.push(
        this.pool
          .query(insertInitialProvinceHistoryQuery, [
            provinces[provinceName].status,
            provinces[provinceName].country,
            gameName,
            provinces[provinceName].name
          ])
          .catch((error: Error) => {
            terminalLog('Insert Province History Error:', error.message);
          })
      );
    }

    return provinceHistoryPromises;
  }

  async insertTerrain(terrain: any[], gameName: string): Promise<any[]> {
    return terrain.map(async (terrain: any) => {
      return this.pool
        .query(insertTerrainQuery, [
          terrain.type,
          terrain.renderCategory,
          terrain.points,
          terrain.bounds.top,
          terrain.bounds.left,
          terrain.bounds.right,
          terrain.bounds.bottom,
          terrain.start,
          terrain.end,
          gameName,
          terrain.province
        ])
        .catch((error: Error) => {
          terminalLog('Insert Terrain Error:', error.message);
        });
    });
  }

  async insertNodes(nodes: any, gameName: string): Promise<any[]> {
    const nodePromises: Promise<any>[] = [];

    for (const nodeName in nodes) {
      nodePromises.push(
        this.pool
          .query(insertNodeQuery, [
            nodes[nodeName].name,
            nodes[nodeName].type,
            nodes[nodeName].loc,
            gameName,
            nodes[nodeName].province
          ])
          .catch((error: Error) => {
            terminalLog('Insert Node Error:', error.message);
          })
      );
    }

    return nodePromises;
  }

  async insertNodeAdjacencies(links: any, gameName: string): Promise<any[]> {
    const nodeAdjacencyPromises: Promise<any>[] = [];

    for (const linkName in links) {
      nodeAdjacencyPromises.push(
        this.pool
          .query(insertNodeAdjacencyQuery, [gameName, links[linkName].alpha.name, links[linkName].omega.name])
          .catch((error: Error) => {
            terminalLog('Insert Node Adjacency Error:', error.message);
          })
      );
    }

    return nodeAdjacencyPromises;
  }

  async insertCountries(countries: any, gameName: string): Promise<any[]> {
    const newCountryPromises: Promise<any>[] = [];

    for (const countryName in countries) {
      newCountryPromises.push(
        this.pool
          .query(insertCountryQuery, [
            countries[countryName].name,
            countries[countryName].rank,
            countries[countryName].color,
            countries[countryName].keyName,
            gameName
          ])
          .catch((error: Error) => {
            terminalLog('Insert Country Error:', error.message);
          })
      );
    }

    return newCountryPromises;
  }

  async insertInitialCountryHistories(countries: any, gameName: string): Promise<any> {
    const countryHistoryPromises: Promise<any>[] = [];

    for (const countryName in countries) {
      countryHistoryPromises.push(
        this.pool
          .query(insertInitialCountryHistoryQuery, [
            countries[countryName].rank !== CountryRank.N ? CountryStatus.ACTIVE : CountryStatus.NPC,
            countries[countryName].cities.length,
            countries[countryName].units.length,
            countries[countryName].bankedBuilds,
            countries[countryName].nuke,
            countries[countryName].adjustments,
            gameName,
            countries[countryName].name
          ])
          .catch((error: Error) => {
            terminalLog('Insert Country History Error:', error.message);
          })
      );
    }

    return countryHistoryPromises;
  }

  async insertUnits(units: any, gameName: string): Promise<any[]> {
    const unitPromises: Promise<any>[] = [];
    for (const unitName in units) {
      unitPromises.push(
        this.pool
          .query(insertUnitQuery, [units[unitName].fullName, units[unitName].type, gameName, units[unitName].country])
          .catch((error: Error) => {
            terminalLog('Insert Unit Error:', error.message);
          })
      );
    }

    return unitPromises;
  }

  async insertInitialUnitHistories(units: any, gameName: string): Promise<any> {
    const initialHistoryPromises: Promise<any>[] = [];

    for (const unitName in units) {
      initialHistoryPromises.push(
        this.pool
          .query(insertInitialUnitHistoryQuery, ['Active', gameName, units[unitName].fullName, units[unitName].node])
          .catch((error: Error) => {
            terminalLog('Insert Unit History Error:', error.message);
          })
      );
    }

    return initialHistoryPromises;
  }

  async insertLabels(labels: any, gameName: string): Promise<void> {
    labels.forEach(async (label: any) => {
      await this.pool
        .query(insertLabelQuery, [label.name, label.type, label.loc, label.text, label.fill, gameName, label.province])
        .catch((error: Error) => {
          terminalLog('Insert Label Error:', error.message);
        });
    });
  }

  async insertLabelLines(labelLines: any, gameName: string): Promise<void> {
    labelLines.forEach(async (labelLine: any) => {
      await this.pool
        .query(insertLabelLineQuery, [
          labelLine.name,
          labelLine.x1,
          labelLine.x2,
          labelLine.y1,
          labelLine.y2,
          labelLine.stroke,
          gameName,
          labelLine.province
        ])
        .catch((error: Error) => {
          terminalLog('Insert Label Line Error:', error.message);
        });
    });
  }

  async updateGameSettings(gameSettings: any[]): Promise<void> {
    await this.pool.query(updateGameSettingsQuery, gameSettings).catch((error: Error) => {
      terminalLog('Update Game Error: ' + error.message);
    });
  }

  async updateTurn(gameStart: any, turnStatus: TurnStatus, turnNumber: number, gameId: number): Promise<void> {
    await this.pool.query(updateTurnQuery, [gameStart, turnStatus, turnNumber, gameId]).catch((error: Error) => {
      terminalLog('Update Turn Error: ' + error.message);
    });
  }

  async checkGameNameAvailable(gameName: string): Promise<any> {
    return await this.pool.query(checkGameNameAvailabilityQuery, [gameName]);
  }

  async getGames(
    userId: number,
    parameters: GameFinderParameters,
    timeZone: string,
    meridiemTime: boolean
  ): Promise<any> {
    return await this.pool
      .query(getGamesQuery, [userId, timeZone, parameters.playing, parameters.creator, parameters.administrator])
      .then((gamesResults: QueryResult<any>) => {
        return gamesResults.rows.map((game: GameSummaryQueryObject) => {
          return new GameSummaryBuilder(game, timeZone, meridiemTime);
        });
      })
      .catch((error: Error) => {
        terminalLog('Get Games Query Error', error.message);
      });
  }

  async isGameAdmin(uid: string, gameId: number): Promise<boolean> {
    return (await this.pool.query(checkUserGameAdminQuery, [uid, gameId])).rows.length > 0;
  }

  async getGameDetails(gameId: number, userId: number, timeZone: string, meridiemTime: boolean): Promise<any> {
    return await this.pool
      .query(getGameDetailsQuery, [gameId, userId, timeZone])
      .then((gameDataResults: any) => {
        return new GameDetailsBuilder(gameDataResults.rows[0], timeZone, meridiemTime);
      })
      .catch((error: Error) => terminalLog('Get Game Data Results Error: ' + error.message));
  }

  async getRulesInGame(gameId: number): Promise<any> {
    return await this.pool
      .query(getRulesInGameQuery, [gameId])
      .then((ruleDataResults: any) => {
        return ruleDataResults.rows.map((rule: any) => this.formattingService.convertKeysSnakeToCamel(rule));
      })
      .catch((error: Error) => terminalLog('Get Rule Data Results Error: ' + error.message));
  }

  async getCountryState(gameId: number, turnNumber: number, countryId: number): Promise<CountryState[]> {
    return await this.pool
      .query(getCountryStateQuery, [gameId, turnNumber, countryId])
      .then((queryResult: QueryResult<any>) =>
        queryResult.rows.map((countryResult: CountryStateResult) => {
          return <CountryState>{
            countryId: countryResult.country_id,
            name: countryResult.country_name,
            cityCount: countryResult.city_count,
            unitCount: countryResult.unit_count,
            retreating: countryResult.in_retreat,
            builds: countryResult.banked_builds,
            nukeRange: countryResult.nuke_range,
            adjustments: countryResult.adjustments,
            nukesInProduction: countryResult.nukes_in_production
          };
        })
      );
  }

  async getGameStats(gameId: number, turnNumber: number): Promise<CountryStats[]> {
    return await this.pool.query(getGameStatsQuery, [gameId, turnNumber]).then((queryResult: QueryResult<any>) =>
      queryResult.rows.map((country: CountryStatsResult) => {
        return <CountryStats>{
          id: country.country_id,
          name: country.country_name,
          rank: country.rank,
          cityCount: country.city_count,
          votes: country.vote_count,
          bankedBuilds: country.banked_builds,
          nuke: country.nuke_range,
          adjustments: country.adjustments
        };
      })
    );
  }

  async getCoalitionSchedule(gameId: number): Promise<CoalitionSchedule> {
    const coalitionSchedules = await this.pool.query(getCoalitionScheduleQuery, [gameId]).then((result: QueryResult) =>
      result.rows.map((schedule: CoalitionScheduleResult) => {
        return <CoalitionSchedule>{
          baseFinal: schedule.base_final,
          penalties: {
            a: schedule.penalty_a,
            b: schedule.penalty_b,
            c: schedule.penalty_c,
            d: schedule.penalty_d,
            e: schedule.penalty_e,
            f: schedule.penalty_f,
            g: schedule.penalty_g
          }
        };
      })
    );

    return coalitionSchedules[0];
  }

  // Get raw rows for the state update comparing
  async getCountryHistories(gameId: number, turnNumber: number): Promise<CountryHistoryRow[]> {
    return await this.pool.query(getCurrentCountryHistoriesQuery, [gameId, turnNumber]).then((result: QueryResult) =>
      result.rows.map((countryHistory: CountryHistoryRowResult) => {
        return <CountryHistoryRow>{
          countryId: countryHistory.country_id,
          countryStatus: countryHistory.country_status,
          cityCount: countryHistory.city_count,
          unitCount: countryHistory.unit_count,
          bankedBuilds: countryHistory.banked_builds,
          nukeRange: countryHistory.nuke_range,
          adjustments: countryHistory.adjustments,
          inRetreat: countryHistory.in_retreat,
          voteCount: countryHistory.vote_count,
          nukesInProduction: countryHistory.nukes_in_production
        };
      })
    );
  }

  async getUnitHistories(gameId: number, turnNumber: number): Promise<UnitHistoryRow[]> {
    return await this.pool.query(getCurrentUnitHistoriesQuery, [gameId, turnNumber]).then((result: QueryResult) =>
      result.rows.map((unitHistory: UnitHistoryRowResult) => {
        return <UnitHistoryRow>{
          unitHistoryId: unitHistory.unit_history_id,
          unitId: unitHistory.unit_id,
          turnId: unitHistory.turn_id,
          nodeId: unitHistory.node_id,
          unitStatus: unitHistory.unit_status
        };
      })
    );
  }

  async getProvinceHistories(gameId: number, turnNumber: number): Promise<ProvinceHistoryRow[]> {
    return await this.pool.query(getCurrentProvinceHistoryQuery, [gameId, turnNumber]).then((result: QueryResult) =>
      result.rows.map((provinceHistory: ProvinceHistoryRowResult) => {
        return <ProvinceHistoryRow>{
          provinceId: provinceHistory.province_id,
          turnId: provinceHistory.turn_id,
          controllerId: provinceHistory.controller_id,
          provinceStatus: provinceHistory.province_status,
          validRetreat: provinceHistory.valid_retreat
        };
      })
    );
  }

  async setGamePlaying(gameId: number): Promise<void> {
    await this.pool.query(startGameQuery, [gameId]);
  }
}
