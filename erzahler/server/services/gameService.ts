import { Pool } from "pg";
import { victorCredentials } from "../../secrets/dbCredentials";

export class GameService {
  async newGame(requestBody: any, idToken: string): Promise<any> {
    const pool: Pool = new Pool(victorCredentials);
    console.log(requestBody);

    // Insert into games
    // Insert into turns
    // Insert into rules
    // Insert into rules_in_games
    // Insert into provinces
    // Insert into terrain
    // Insert into bridges
    // Insert into labels
    // Insert into nodes
    // Insert into node_adjacencies
    // Insert into countries
    // Insert into country_history
    // Insert into units
    // Insert into unit_history
    // Insert into assignments

    return 'A new phase begins!';
  }
}