import { DecodedIdToken } from "firebase-admin/auth";
import { Pool } from "pg";
import { insertAssignmentsQuery } from "../../database/queries/new-game/insert-assignments-query";
import { insertNewGameQuery } from "../../database/queries/new-game/insert-game-query";
import { insertTurnQuery } from "../../database/queries/new-game/insert-turn-query";
import { victorCredentials } from "../../secrets/dbCredentials";
import { AccountService } from "./accountService";

export class GameService {

  async newGame(gameSettings: any, idToken: string): Promise<any> {
    const accountService: AccountService = new AccountService();

    const token: DecodedIdToken = await accountService.validateToken(idToken);
    if (token.uid) {
      const user: any = accountService.getUserProfile(idToken);

      const pool: Pool = new Pool(victorCredentials);
      console.log(gameSettings);

      // Insert into games
      const newGame: any = await this.addNewGame(pool, gameSettings);
      // Insert into assignments
      await this.addNewAssignment(pool, user.user_id, newGame.game_id);

      // Insert into turns
      await this.addNewTurn(pool, gameSettings, newGame.game_id);
      // Insert into rules_in_games
      // Insert into provinces
      // Insert into province_history
      // Insert into terrain
      // Insert into bridges
      // Insert into labels
      // Insert into nodes
      // Insert into node_adjacencies
      // Insert into countries
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
}