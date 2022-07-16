import { Pool } from "pg";
import { victorCredentials } from "../../secrets/dbCredentials";

export class GameService {
  async newGame(requestBody: any, idToken: string): Promise<any> {
    const pool: Pool = new Pool(victorCredentials);
    console.log(requestBody);

    // Insert into games
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
}