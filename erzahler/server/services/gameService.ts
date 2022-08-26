import { error } from "console";
import { DecodedIdToken } from "firebase-admin/auth";
import { Pool, PoolConfig } from "pg";
import { insertAssignmentsQuery } from "../../database/queries/new-game/insert-assignments-query";
import { insertBridgeQuery } from "../../database/queries/new-game/insert-bridge-query";
import { insertCountryHistoryQuery } from "../../database/queries/new-game/insert-country-history-query";
import { insertCountryQuery } from "../../database/queries/new-game/insert-country-query";
import { insertNewGameQuery } from "../../database/queries/new-game/insert-game-query";
import { insertLabelsQuery } from "../../database/queries/new-game/insert-labels-query";
import { insertNodeAdjacencyQuery } from "../../database/queries/new-game/insert-node-adjacency-query";
import { insertNodeQuery } from "../../database/queries/new-game/insert-node-query";
import { insertProvinceHistoryQuery } from "../../database/queries/new-game/insert-province-history-query";
import { insertProvinceQuery } from "../../database/queries/new-game/insert-province-query";
import { insertRulesInGamesQuery } from "../../database/queries/new-game/insert-rules-in-games-query";
import { insertTerrainQuery } from "../../database/queries/new-game/insert-terrain-query";
import { insertTurnQuery } from "../../database/queries/new-game/insert-turn-query";
import { insertUnitHistoryQuery } from "../../database/queries/new-game/insert-unit-history-query";
import { insertUnitQuery } from "../../database/queries/new-game/insert-unit-query";
import { victorCredentials } from "../../secrets/dbCredentials";
import { AccountService } from "./accountService";

export class GameService {

  async newGame(gameData: any, idToken: string): Promise<any> {
    const accountService: AccountService = new AccountService();

    const token: DecodedIdToken = await accountService.validateToken(idToken);
    if (token.uid) {
      const user: any = await accountService.getUserProfile(idToken);

      const pool: Pool = new Pool(victorCredentials);
      console.log('Game Data', gameData);

      // Insert into games
      const newGameId: number = await this.addNewGame(pool, gameData);
      console.log('New Game Id:', newGameId);

      // Insert into assignments
      await this.addNewAssignment(pool, newGameId, user.user_id);

      // Insert into turns
      const newTurnId: number = await this.addNewTurn(pool, gameData, newGameId);

      // Insert into rules_in_games
      await this.addNewRulesInGame(pool, gameData, newGameId);

      // Insert into countries
      await this.addNewCountries(pool, gameData, newGameId);

      // Insert into provinces
      await this.addNewProvinces(pool, gameData, newGameId);
      const newProvinceId: number = 0;

      // Insert into province_history
      await this.addNewProvinceHistories(pool, gameData, newTurnId);

      // Insert into terrain
      await this.addNewTerrain(pool, gameData, newProvinceId);

      // Insert into bridges
      await this.addNewBridges(pool, gameData);

      // Insert into labels
      await this.addNewLabels(pool, gameData);

      // Insert into nodes
      await this.addNewNodes(pool, gameData);

      // Insert into node_adjacencies
      await this.addNewNodeAdjacencies(pool, gameData);

      // Insert into country_history
      await this.addNewCountryHistory(pool, gameData, 0);

      // Insert into units
      await this.addNewUnits(pool, gameData);

      // Insert into unit_history
      await this.addNewUnitHistory(pool, gameData, newTurnId);
    }

    return 'A new phase begins!';
  }

  async addNewGame(pool: Pool, settings: any): Promise<number> {
    const settingsArray: any = [
      settings.gameName,
      settings.assignmentMethod,
      settings.turn1Timing,
      settings.concurrentGamesLimit,
      settings.blindAdministrator,
      settings.privateGame,
      settings.hiddenGame,
      settings.deadlineType,
      settings.ordersDay,
      settings.ordersTime,
      settings.retreatsDay,
      settings.retreatsTime,
      settings.adjustmentsDay,
      settings.adjustmentsTime,
      settings.nominationsDay,
      settings.nominationsTime,
      settings.votesDay,
      settings.votesTime,
      settings.nmrRemoval
    ];

    const result: any = await pool.query({
      text: insertNewGameQuery,
      values: settingsArray
    })
    .then((results: any) => {
      return results;
    })
    .catch((error: Error) => {
      console.log('New game Error:', error.message);
      return 0;
    });

    return result.rows[0].game_id;
  }

  async addNewAssignment(pool: Pool, gameId: number, userId: number): Promise<void> {
    console.log(`New assignment Entry: gameId (${gameId}), userId (${userId})`);
    pool.query(insertAssignmentsQuery, [
      userId,
      gameId
    ])
    .then((result: any) => {
      console.log('New Assignment', result)
    })
    .catch((error: Error) => {
      console.log('New Assignment Error:', error.message);
    });
  }

  async addNewTurn(pool: Pool, settings: any, gameId: number): Promise<number> {
    return pool.query(insertTurnQuery, [
      settings.deadline,
      1,
      'Spring 2001',
      'orders',
      'active'
    ])
    .then((result: any) => {
      return result.rows[0].turn_id;
    })
    .catch((error: Error) => {
      return 0;
    });
  }

  async addNewRulesInGame(pool: Pool, settings: any, gameId: number): Promise<any> {
    settings.rules.forEach(async (rule: any) => {
      const ruleId: number = await this.getRuleId(rule.name);
      pool.query(insertRulesInGamesQuery, [
        ruleId,
        gameId,
        rule.ruleEnabled
      ]);
    });
  }

  async getRuleId(name: string): Promise<number> {
    return 13;
  }

  async addNewCountries(pool: Pool, gameData: any, gameId: number): Promise<any> {
    gameData.countries.forEach(async (country: any) => {
      pool.query(insertCountryQuery, [
        gameId,
        country.name,
        country.rank,
        country.color,
        country.flagKey
      ]);
    })
  }

  async addNewProvinces(pool: Pool, settings: any, gameId: number): Promise<any> {
    settings.provinces.forEach(async (province: any) => {
      pool.query(insertProvinceQuery, [
        gameId,
        province.name,
        province.fullName,
        province.type,
        province.voteType
      ]);
    });
  }

  async addNewProvinceHistories(pool: Pool, gameData: any, turnId: number): Promise<any> {
    gameData.provinces.forEach(async (province: any) => {
      pool.query(insertProvinceHistoryQuery, [
        province.province_id,
        turnId,
        province.controller_id,
        province.status,
        province.vote_color,
        province.status_color
      ]);
    });
  }

  async addNewTerrain(pool: Pool, gameData: any, newProvinceId: number): Promise<any> {
    gameData.provinces.terrain.forEach(async (terrain: any) => {
      pool.query(insertTerrainQuery, [
        newProvinceId,
        terrain.renderCategory,
        terrain.points,
        terrain.topBound,
        terrain.leftBound,
        terrain.rightBound,
        terrain.bottomBound
      ]);
    });
  }

  async addNewBridges(pool: Pool,  gameData: any): Promise<any>{
    gameData.bridges.forEach(async (bridge: any) => {
      pool.query(insertBridgeQuery, [
        bridge.province1,
        bridge.province2,
        bridge.points
      ]);
    });
  }

  async addNewLabels(pool: Pool, gameData: any): Promise<any> {
    gameData.labels.forEach(async (label: any) => {
      pool.query(insertLabelsQuery, [
        label.provinceId,
        label.loc,
        label.labelText
      ]);
    });
  }

  async addNewNodes(pool: Pool, gameData: any): Promise<any> {
    gameData.provinces.nodes.forEach(async (node: any) => {
      pool.query(insertNodeQuery, [
        node.province_id,
        node.node_type,
        node.loc
      ]);
    });
  }

  async addNewNodeAdjacencies(pool: Pool, gameData: any): Promise<any> {
    gameData.nodeAdjacencies.forEach(async (link: any) => {
      pool.query(insertNodeAdjacencyQuery, [
        link.node1,
        link.node2
      ]);
    });
  }

  async addNewCountryHistory(pool: Pool, gameData: any, newTurnId: number): Promise<any> {
    gameData.nodeAdjacencies.forEach(async (country: any) => {
      pool.query(insertCountryHistoryQuery, [
        country.country_id,
        newTurnId,
        country.status,
        country.city_count,
        country.unit_count,
        country.banked_builds,
        country.nuked_range,
        country.adjustments
      ]);
    });
  }

  async addNewUnits(pool: Pool, gameData: any): Promise<any> {
    gameData.units.forEach(async (unit: any) => {
      pool.query(insertUnitQuery, [
        unit.country,
        unit.type
      ]);
    });
  }

  async addNewUnitHistory(pool: Pool, gameData: any, turnId: number): Promise<any> {
    gameData.units.forEach(async (unit: any) => {
      pool.query(insertUnitHistoryQuery, [
        unit.id,
        turnId,
        unit.node,
        'active'
      ]);
    });
  }
}