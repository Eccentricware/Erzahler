import { DecodedIdToken } from "firebase-admin/auth";
import { Pool, PoolConfig } from "pg";
import { insertAssignmentsQuery } from "../../database/queries/new-game/insert-assignments-query";
import { insertBridgeQuery } from "../../database/queries/new-game/insert-bridge-query";
import { insertCountryQuery } from "../../database/queries/new-game/insert-country-query";
import { insertNewGameQuery } from "../../database/queries/new-game/insert-game-query";
import { insertLabelsQuery } from "../../database/queries/new-game/insert-labels-query";
import { insertProvinceHistoryQuery } from "../../database/queries/new-game/insert-province-history-query";
import { insertProvinceQuery } from "../../database/queries/new-game/insert-province-query";
import { insertRulesInGamesQuery } from "../../database/queries/new-game/insert-rules-in-games-query";
import { insertTerrainQuery } from "../../database/queries/new-game/insert-terrain-query";
import { insertTurnQuery } from "../../database/queries/new-game/insert-turn-query";
import { victorCredentials } from "../../secrets/dbCredentials";
import { AccountService } from "./accountService";

export class GameService {

  async newGame(gameData: any, idToken: string): Promise<any> {
    const accountService: AccountService = new AccountService();

    const token: DecodedIdToken = await accountService.validateToken(idToken);
    if (token.uid) {
      const user: any = accountService.getUserProfile(idToken);

      const pool: Pool = new Pool(victorCredentials);
      console.log(gameData);

      // Insert into games
      const newGame: any = await this.addNewGame(pool, gameData);
      const newGameId: number = 0;

      // Insert into assignments
      await this.addNewAssignment(pool, user.user_id, newGameId);

      // Insert into turns
      await this.addNewTurn(pool, gameData, newGameId);
      const newTurnId: number = 0;

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
      // Insert into node_adjacencies
      // Insert into country_history
      // Insert into units
      // Insert into unit_history
    }

    return 'A new phase begins!';
  }

  async addNewGame(pool: Pool, settings: any): Promise<any> {
    return pool.query(insertNewGameQuery, [
      settings.gameName,
      settings.startMethod,
      settings.startTime,
      settings.stylizedYearStart,
      settings.concurrentGamesLimit,
      settings.blindAdministrator,
      settings.privateGame,
      settings.hiddenGame,
      settings.deadlineType,
      settings.ordersDeadline,
      settings.retreatsDeadline,
      settings.adjustmentsDeadline,
      settings.nominationsDeadline,
      settings.votesDeadline,
      settings.nmrRemoval
    ]);
  }

  async addNewAssignment(pool: Pool, gameId: number, userId: number): Promise<any> {
    return pool.query(insertAssignmentsQuery, [
      userId,
      gameId
    ]);
  }

  async addNewTurn(pool: Pool, settings: any, gameId: number): Promise<any> {
    return pool.query(insertTurnQuery, [
      settings.deadline,
      1,
      'Spring 2001',
      'orders',
      'active'
    ]);
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
}