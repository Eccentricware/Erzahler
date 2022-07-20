import { Pool } from "pg";
import { insertNewGameQuery } from "../../database/queries/new-game/insert-game-query";
import { victorCredentials } from "../../secrets/dbCredentials";

export class GameService {
  async newGame(requestBody: any, idToken: string): Promise<any> {
    const pool: Pool = new Pool(victorCredentials);
    console.log(requestBody);

    // Insert into games
    const newGame: any = await this.addNewGame(requestBody, pool);
    // Insert into assignments
    // Insert into turns
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

    return 'A new phase begins!';
  }

  async addNewGame(settings: any, pool: Pool): Promise<any> {
    return pool.query(insertNewGameQuery, [
      settings.gameName,
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
}