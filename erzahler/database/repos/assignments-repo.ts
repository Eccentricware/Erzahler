import { Pool, QueryResult } from "pg";
import { IDatabase, IMain } from "pg-promise";
import { victorCredentials } from "../../secrets/dbCredentials";
import { FormattingService } from "../../server/services/formattingService";
import { assignUserQuery } from "../queries/assignments/assign-user-query";
import { clearCountryAssignmentsQuery } from "../queries/assignments/clear-country-assignments-query";
import { getPlayerCountryQuery } from "../queries/assignments/get-player-country-query";
import { getPlayerRegistrationStatusQuery } from "../queries/assignments/get-player-registration-status";
import { lockAssignmentQuery } from "../queries/assignments/lock-assignment-query";
import { registerUserQuery } from "../queries/assignments/register-user-query";
import { reregisterUserQuery } from "../queries/assignments/reregister-user-query";
import { unlockAssignmentQuery } from "../queries/assignments/unlock-assignment-query";
import { unregisterUserQuery } from "../queries/assignments/unregister-user-query";
import { getAssignmentsQuery } from "../queries/game/get-assignments-query";
import { getGameAdminsQuery } from "../queries/game/get-game-admins-query";
import { getRegisteredPlayersQuery } from "../queries/game/get-registered-players-query";

/**
 * Handles DB updates involving user associations with games.
 */
export class AssignmentRepository {
  pool = new Pool(victorCredentials);
  formattingService = new FormattingService();
  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async getGameAdmins(gameId: number): Promise<any> {
    return await this.pool.query(getGameAdminsQuery, [gameId])
      .then((results: QueryResult) => results.rows )
      .catch((error: Error) => {
        console.log('Get Game Admins Query Error: ' + error.message);
        return [];
      });
  }

  async getAssignments(gameId: number, userId: number): Promise<any> {
    return await this.pool.query(getAssignmentsQuery, [gameId, userId])
    .then((assignmentDataResults: QueryResult<any>) => {
      return assignmentDataResults.rows.map((assignment: any) => this.formattingService.convertKeysSnakeToCamel(assignment));
    })
    .catch((error: Error) => console.log('Get Assignment Data Results Error: ' + error.message));
  }

  async saveRegisterUser(gameId: number, userId: number, assignmentType: string): Promise<any> {
    return await this.pool.query(registerUserQuery, [gameId, userId, assignmentType])
      .then(() => { return {success: true }; })
      .catch((error: Error) => {
        console.log('Insert assignment error: ' + error.message);
        return {
          success: false,
          message: error.message
        }
      });
  }

  async saveUnregisterUser(gameId: number, userId: number, assignmentType: string): Promise<any> {
    return await this.pool.query(unregisterUserQuery, [gameId, userId, assignmentType])
      .then(() => { return {success: true }; })
      .catch((error: Error) => { console.log('Unregister User Error: ' + error.message); });
  }

  async saveReregisterUser(gameId: number, userId: number, assignmentType: string): Promise<any> {
    return await this.pool.query(reregisterUserQuery, [gameId, userId, assignmentType])
      .then(() => { return {success: true }; })
      .catch((error: Error) => {
        console.log('Update assignment error: ' + error.message);
        return {
          success: false,
          message: error.message
        }
      });
  }

  async getRegisteredPlayers(gameId: number): Promise<any> {
    return await this.pool.query(getRegisteredPlayersQuery, [gameId])
    .then((registeredUserResults: QueryResult<any>) => {
      return registeredUserResults.rows.map((player: any) => this.formattingService.convertKeysSnakeToCamel(player));
    })
    .catch((error: Error) => console.log('Get Registered Player Data Results Error: ' + error.message));
  }

  async getPlayerRegistrationStatus(gameId: number, userId: number): Promise<any> {
    return await this.pool.query(getPlayerRegistrationStatusQuery, [gameId, userId])
    .then((playerRegistrationResults: QueryResult<any>) => {
      return playerRegistrationResults.rows.map((registrationType: any) => this.formattingService.convertKeysSnakeToCamel(registrationType));
    })
    .catch((error: Error) => console.log('Get Player Registration Types Results Error: ' + error.message));
  }

  async clearCountryAssignments(gameId: number, countryId: number): Promise<void> {
    await this.pool.query(clearCountryAssignmentsQuery, [gameId, countryId])
    .catch((error: Error) => { console.log('Clear Country Assignments Error: ' + error.message)});
  }

  async assignPlayer(countryId: number, gameId: number, playerId: number): Promise<void> {
    await this.pool.query(assignUserQuery, [countryId, gameId, playerId])
      .catch((error: Error) => { console.log('Assign User Error: ' + error.message)});
  }

  async saveLockAssignment(gameId: number, playerId: number): Promise<void> {
    await this.pool.query(lockAssignmentQuery, [gameId, playerId]);
  }

  async saveUnlockAssignment(gameId: number, playerId: number): Promise<void> {
    await this.pool.query(unlockAssignmentQuery, [gameId, playerId]);
  }

  async getCountryAssignment(gameId: number, userId: number): Promise<number> {
    const countryIds = await this.pool.query(getPlayerCountryQuery, [gameId, userId])
      .then((queryResult: QueryResult<any>) => queryResult.rows.map((result: any) => result.country_id ));

    return countryIds.length > 0 ? countryIds[0] : 0;
  }
}