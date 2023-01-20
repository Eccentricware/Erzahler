import { Pool, QueryResult } from "pg";
import { IDatabase, IMain } from "pg-promise";
import { GameDetailsBuilder } from "../../models/classes/game-details-builder";
import { GameSummaryBuilder } from "../../models/classes/game-summary-builder";
import { CountryRank, CountryStatus } from "../../models/enumeration/country-enum";
import { TurnStatus } from "../../models/enumeration/turn-status-enum";
import { GameSummaryQueryObject } from "../../models/objects/game-summary-query-object";
import { GameState, GameStateResult } from "../../models/objects/last-turn-info-object";
import { StartScheduleEvents } from "../../models/objects/start-schedule-events-object";
import { StartScheduleObject } from "../../models/objects/start-schedule-object";
import { victorCredentials } from "../../secrets/dbCredentials";
import { FormattingService } from "../../server/services/formattingService";
import { getPlayerRegistrationStatusQuery } from "../queries/assignments/get-player-registration-status";
import { checkGameNameAvailabilityQuery } from "../queries/game/check-game-name-availability-query";
import { checkUserGameAdminQuery } from "../queries/game/check-user-game-admin-query";
import { getGameDetailsQuery } from "../queries/game/get-game-details-query";
import { getGamesQuery } from "../queries/game/get-games-query";
import { getRulesInGameQuery } from "../queries/game/get-rules-in-game-query";
import { insertAssignmentQuery } from "../queries/game/insert-assignment-query";
import { insertCoalitionScheduleQuery } from "../queries/game/insert-coalition-schedule-query";
import { insertCountryHistoryQuery } from "../queries/game/insert-country-history-query";
import { insertCountryQuery } from "../queries/game/insert-country-query";
import { insertNewGameQuery } from "../queries/game/insert-game-query";
import { insertInitialProvinceHistoryQuery } from "../queries/game/insert-initial-province-history-query";
import { insertLabelQuery } from "../queries/game/insert-label-query";
import { insertNodeAdjacencyQuery } from "../queries/game/insert-node-adjacency-query";
import { insertNodeQuery } from "../queries/game/insert-node-query";
import { insertProvinceQuery } from "../queries/game/insert-province-query";
import { insertRuleInGameQuery } from "../queries/game/insert-rule-in-game-query";
import { insertTerrainQuery } from "../queries/game/insert-terrain-query";
import { insertTurnQuery } from "../queries/game/insert-turn-query";
import { insertUnitHistoryQuery } from "../queries/game/insert-unit-history-query";
import { insertUnitQuery } from "../queries/game/insert-unit-query";
import { updateGameSettingsQuery } from "../queries/game/update-game-settings-query";
import { updateTurnQuery } from "../queries/game/update-turn-query";
import { getAirAdjQuery } from "../queries/orders/get-air-adj-query";
import { getGameStateQuery } from "../queries/orders/get-game-state-query";

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
]
export class GameRepository {
  formattingService = new FormattingService();
  pool = new Pool(victorCredentials);
  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async getGameState(gameId: number): Promise<any> {
    const gameState: GameState = await this.pool.query(getGameStateQuery, [gameId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((gameStateResult: GameStateResult) => {
          return <GameState> {
            gameId: gameStateResult.game_id,
            turnId: gameStateResult.turn_id,
            deadline: gameStateResult.deadline,
            turnNumber: gameStateResult.turn_number,
            turnName: gameStateResult.turn_name,
            turnType: gameStateResult.turn_type,
            turnStatus: gameStateResult.turn_status,
            resolvedTime: gameStateResult.resolved_time,
            deadlineMissed: gameStateResult.deadline_missed,
            nominateDuringAdjustments: gameStateResult.nominate_during_adjustments,
            voteDuringSpring: gameStateResult.vote_during_spring,
            nominationTiming: gameStateResult.nomination_timing,
            nominationYear: gameStateResult.nomination_year,
            currentYear: gameStateResult.current_year,
            yearNumber: gameStateResult.year_number,
            highestRankedReq: gameStateResult.highest_ranked_req,
            allVotesControlled: gameStateResult.all_votes_controlled,
            unitsInRetreat: gameStateResult.unit_in_retreat
          }
        })[0];
      });

    return gameState;
  }

  async insertGame(settingsArray: any[]): Promise<any> {
    return this.pool.query(insertNewGameQuery, settingsArray);
  }

  async insertRulesInGame(rules: any, gameName: string): Promise<any[]> {
    return rules.map(async (rule: any) => {
      return await this.pool.query(insertRuleInGameQuery, [
        gameName,
        rule.key,
        rule.enabled
      ])
      .catch((error: Error) => {
        console.log('Rule In Games Error:', error.message);
      });
    });

  }

  async insertCoalitionScheduleQuery(gameName: string): Promise<void> {
    await this.pool.query(insertCoalitionScheduleQuery, [
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
      console.log('Add Coalition Error:', error.message);
    });
  }

  async insertAssignment(
    userId: number,
    countryId: number | undefined,
    assignmentType: string,
    gameName: string
  ): Promise<void> {
    await this.pool.query(insertAssignmentQuery, [
      userId,
      null,
      'Creator',
      gameName
    ])
    .catch((error: Error) => {
      console.log('New Assignment Error:', error.message);
    });
  }

  async insertTurn(turnArgs: any[]): Promise<any> {
    return this.pool.query(insertTurnQuery, turnArgs);
  }

  async insertProvinces(provinces: any, gameName: string): Promise<any[]> {
   const provincePromises: Promise<any>[] = [];

    for (let provinceName in provinces) {
      provincePromises.push(this.pool.query(insertProvinceQuery, [
        provinces[provinceName].name,
        provinces[provinceName].fullName,
        provinces[provinceName].type,
        provinces[provinceName].voteType,
        provinces[provinceName].cityLoc,
        gameName
      ])
      .catch((error: Error) => {
        console.log('Insert Province Error:', error.message);
      }));
    }

    return provincePromises;
  }

  async insertProvinceHistories(provinces: any, gameName: string): Promise<any[]> {
   const provinceHistoryPromises: Promise<any>[] = [];

    for (let provinceName in provinces) {
      provinceHistoryPromises.push(this.pool.query(insertInitialProvinceHistoryQuery, [
        provinces[provinceName].status,
        provinces[provinceName].voteColor,
        provinces[provinceName].statusColor,
        provinces[provinceName].strokeColor,
        provinces[provinceName].country,
        provinces[provinceName].owner,
        gameName,
        provinces[provinceName].name
      ])
      .catch((error: Error) => {
        console.log('Insert Province History Error:', error.message);
      }));
    }

    return provinceHistoryPromises;
  }

  async insertTerrain(terrain: any[], gameName: string): Promise<any[]> {
   return terrain.map(async (terrain: any) => {
      return this.pool.query(insertTerrainQuery, [
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
        terrain.province,
      ])
      .catch((error: Error) => {
        console.log('Insert Terrain Error:', error.message);
      });
    });
  }

  async insertNodes(nodes: any, gameName: string): Promise<any[]> {
   const nodePromises: Promise<any>[] = [];

    for (let nodeName in nodes) {
      nodePromises.push(this.pool.query(insertNodeQuery, [
        nodes[nodeName].name,
        nodes[nodeName].type,
        nodes[nodeName].loc,
        gameName,
        nodes[nodeName].province
      ])
      .catch((error: Error) => {
        console.log('Insert Node Error:', error.message);
      }));
    }

    return nodePromises;
  }

  async insertNodeAdjacencies(links: any, gameName: string): Promise<any[]> {
   const nodeAdjacencyPromises: Promise<any>[] = [];

    for (let linkName in links) {
      nodeAdjacencyPromises.push(this.pool.query(insertNodeAdjacencyQuery, [
        gameName,
        links[linkName].alpha.name,
        links[linkName].omega.name
      ])
      .catch((error: Error) => {
        console.log('Insert Node Adjacency Error:', error.message);
      }));
    }

    return nodeAdjacencyPromises;
  }

  async insertCountries(countries: any, gameName: string): Promise<any[]> {
   const newCountryPromises: Promise<any>[] = [];

    for (let countryName in countries) {
      newCountryPromises.push(this.pool.query(insertCountryQuery, [
        countries[countryName].name,
        countries[countryName].rank,
        countries[countryName].color,
        countries[countryName].keyName,
        gameName
      ])
      .catch((error: Error) => {
        console.log('Insert Country Error:', error.message);
      }));
    }

    return newCountryPromises;
  }

  async insertCountryHistories(countries: any, gameName: string): Promise<any> {
   const countryHistoryPromises: Promise<any>[] = [];

    for (let countryName in countries) {
      countryHistoryPromises.push(this.pool.query(insertCountryHistoryQuery, [
        countries[countryName].rank !== CountryRank.N ? CountryStatus.ACTIVE : CountryStatus.NPC,
        countries[countryName].cities.length,
        countries[countryName].units.length,
        countries[countryName].bankedBuilds,
        countries[countryName].nuke,
        countries[countryName].adjustments,
        gameName,
        countries[countryName].name,
      ])
      .catch((error: Error) => {
        console.log('Insert Country History Error:', error.message);
      }));
    }

    return countryHistoryPromises;
  }


  async insertUnits(units: any, gameName: string): Promise<any[]> {
    const pool: Pool = new Pool(victorCredentials);

    const unitPromises: Promise<any>[] = [];
    for (let unitName in units) {
      unitPromises.push(this.pool.query(insertUnitQuery, [
        units[unitName].fullName,
        units[unitName].type,
        gameName,
        units[unitName].country
      ])
      .catch((error: Error) => {
        console.log('Insert Unit Error:', error.message);
      }));
    }

    return unitPromises;
  }

  async insertUnitHistories(units: any, gameName: string): Promise<any> {
   const initialHistoryPromises: Promise<any>[] = [];

    for (let unitName in units) {
      initialHistoryPromises.push(this.pool.query(insertUnitHistoryQuery, [
        'Active',
        gameName,
        units[unitName].fullName,
        units[unitName].node
      ])
      .catch((error: Error) => {
        console.log('Insert Unit History Error:', error.message);
      }));
    }

    return initialHistoryPromises;
  }

  async insertLabels(labels: any, gameName: string): Promise<void> {
    labels.forEach(async (label: any) => {
      await this.pool.query(insertLabelQuery, [
        label.name,
        label.type,
        label.loc,
        label.text,
        label.fill,
        gameName,
        label.province
      ])
      .catch((error: Error) => {
        console.log('Insert Label Error:', error.message);
      });
    });
  }

  async updateGameSettings(gameSettings: any[]): Promise<void> {
    await this.pool.query(updateGameSettingsQuery, gameSettings)
      .catch((error: Error) => {
        console.log('Update Game Error: ' + error.message);
      });
  }

  async updateTurn(gameStart: any, turnStatus: TurnStatus, turnNumber: number, gameId: number): Promise<void> {
    await this.pool.query(updateTurnQuery, [gameStart, turnStatus, turnNumber, gameId])
    .catch((error: Error) => {
      console.log('Update Turn Error: ' + error.message);
    });
  }

  async checkGameNameAvailable(gameName: string): Promise<any> {
    return await this.pool.query(checkGameNameAvailabilityQuery, [gameName]);
  }

  async getGames(timeZone: string, meridiemTime: boolean): Promise<any> {
    return await this.pool.query(getGamesQuery, [timeZone])
      .then((gamesResults: QueryResult<any>) => {
        return gamesResults.rows.map((game: GameSummaryQueryObject) => {
          return new GameSummaryBuilder(game, timeZone, meridiemTime);
        });
      })
      .catch((error: Error) => {
        console.log('Get Games Query Error', error.message);
      });
  }

  async isGameAdmin(uid: string, gameId: number): Promise<boolean> {
   return (await this.pool.query(checkUserGameAdminQuery, [uid, gameId])).rows.length > 0;
  }

  async getGameDetails(gameId: number, userId: number, timeZone: string, meridiemTime: boolean): Promise<any> {
    return await this.pool.query(getGameDetailsQuery, [gameId, userId, timeZone])
      .then((gameDataResults: any) => {
        return new GameDetailsBuilder(gameDataResults.rows[0], timeZone, meridiemTime);
      })
      .catch((error: Error) => console.log('Get Game Data Results Error: ' + error.message));
  }

  async getRulesInGame(gameId: number): Promise<any> {
    return await this.pool.query(getRulesInGameQuery, [gameId])
      .then((ruleDataResults: any) => {
        return ruleDataResults.rows.map((rule: any) => this.formattingService.convertKeysSnakeToCamel(rule));
      })
      .catch((error: Error) => console.log('Get Rule Data Results Error: ' + error.message));
  }

  async getPlayerRegistrationStatus(gameId: number, userId: number): Promise<any> {
    return await this.pool.query(getPlayerRegistrationStatusQuery, [gameId, userId])
      .then((playerRegistrationResults: any) => {
        return playerRegistrationResults.rows.map((registrationType: any) => this.formattingService.convertKeysSnakeToCamel(registrationType));
      })
      .catch((error: Error) => console.log('Get Player Registration Types Results Error: ' + error.message));
  }
}