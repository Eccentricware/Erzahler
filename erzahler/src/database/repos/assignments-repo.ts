import { Pool, QueryResult } from 'pg';
import { IDatabase, IMain, as } from 'pg-promise';
import { envCredentials } from '../../secrets/dbCredentials';
import { FormattingService } from '../../server/services/formatting-service';
import { assignUserQuery } from '../queries/assignments/assign-user-query';
import { clearCountryAssignmentsQuery } from '../queries/assignments/clear-country-assignments-query';
import { getUserGameAssignmentsQuery } from '../queries/assignments/get-user-game-assignments-query';
import { lockAssignmentQuery } from '../queries/assignments/lock-assignment-query';
import {
  getUserRegistrationsQuery,
  registerUserQuery,
  reregisterUserQuery,
  unregisterUserQuery
} from '../queries/assignments/registration-queries';
import { unlockAssignmentQuery } from '../queries/assignments/unlock-assignment-query';
import { getAssignmentsQuery } from '../queries/game/get-assignments-query';
import { getGameAdminsQuery } from '../queries/game/get-game-admins-query';
import {
  Assignment,
  AssignmentDetails,
  AssignmentDetailsResult,
  AssignmentResult,
  UserAssignment,
  UserAssignmentResult
} from '../../models/objects/assignment-objects';
import { getPlayerIsCountryQuery } from '../queries/assignments/get-player-is-country-query';
import { terminalLog } from '../../server/utils/general';
import {
  CountryAuthorization,
  CountryAuthorizationResult
} from '../../models/objects/orders/expected-order-types-object';

/**
 * Handles DB updates involving user associations with games.
 */
export class AssignmentRepository {
  pool = new Pool(envCredentials);
  formattingService = new FormattingService();
  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async getGameAdmins(gameId: number): Promise<any> {
    return await this.pool
      .query(getGameAdminsQuery, [gameId])
      .then((results: QueryResult) => results.rows)
      .catch((error: Error) => {
        console.log('Get Game Admins Query Error: ' + error.message);
        return [];
      });
  }

  async getAssignments(gameId: number, userId: number): Promise<AssignmentDetails[]> {
    return await this.pool
      .query(getAssignmentsQuery, [gameId, userId])
      .then((assignmentDataResults: QueryResult<AssignmentDetailsResult>) => {
        return assignmentDataResults.rows.map(
          (assignment: AssignmentDetailsResult) =>
            <AssignmentDetails>{
              assignmentId: assignment.assignment_id,
              countryId: assignment.country_id,
              countryName: assignment.country_name,
              rank: assignment.rank,
              playerId: assignment.player_id,
              username: assignment.username,
              assignmentStatus: assignment.assignment_status,
              contactPreferences: assignment.contact_preferences ? assignment.contact_preferences[0] : null
            }
        );
      })
      .catch((error: Error) => {
        terminalLog('Get Assignment Data Results Error: ' + error.message);
        return [];
      });
  }

  async saveRegisterUser(gameId: number, userId: number, assignmentType: string): Promise<any> {
    return await this.pool
      .query(registerUserQuery, [gameId, userId, assignmentType])
      .then(() => {
        return { success: true };
      })
      .catch((error: Error) => {
        console.log('Insert assignment error: ' + error.message);
        return {
          success: false,
          message: error.message
        };
      });
  }

  async saveUnregisterUser(gameId: number, userId: number, assignmentType: string): Promise<any> {
    return await this.pool
      .query(unregisterUserQuery, [gameId, userId, assignmentType])
      .then(() => {
        return { success: true };
      })
      .catch((error: Error) => {
        console.log('Unregister User Error: ' + error.message);
      });
  }

  async saveReregisterUser(gameId: number, userId: number, assignmentType: string): Promise<any> {
    return await this.pool
      .query(reregisterUserQuery, [gameId, userId, assignmentType])
      .then(() => {
        return { success: true };
      })
      .catch((error: Error) => {
        console.log('Update assignment error: ' + error.message);
        return {
          success: false,
          message: error.message
        };
      });
  }

  // async getRegisteredPlayers(gameId: number): Promise<any> {
  //   return await this.pool
  //     .query(getUserRegistrationsQuery, [gameId, 0])
  //     .then((registeredUserResults: QueryResult<any>) => {
  //       return registeredUserResults.rows.map((player: any) => this.formattingService.convertKeysSnakeToCamel(player));
  //     })
  //     .catch((error: Error) => console.log('Get Registered Player Data Results Error: ' + error.message));
  // }

  async getUserRegistrations(gameId: number, userId?: number): Promise<Assignment[]> {
    return await this.pool
      .query(getUserRegistrationsQuery, [gameId, userId ? userId : 0])
      .then((playerRegistrationResults: QueryResult<AssignmentResult>) =>
        playerRegistrationResults.rows.map((assignmentResult: AssignmentResult) => {
          return {
            userId: assignmentResult.user_id,
            username: assignmentResult.username,
            assignmentId: assignmentResult.assignment_id,
            assignmentType: assignmentResult.assignment_type,
            assignmentStatus: assignmentResult.assignment_status,
            assignmentStart: assignmentResult.assignment_start,
            assignmentEnd: assignmentResult.assignment_end,
            countryId: assignmentResult.country_id,
            gameId: assignmentResult.game_id
          };
        })
      )
      .catch((error: Error) => {
        terminalLog('Get Registered Users Error: ' + error.message);
        return [];
      });
  }

  async clearCountryAssignments(gameId: number, countryId: number): Promise<void> {
    await this.pool.query(clearCountryAssignmentsQuery, [gameId, countryId]).catch((error: Error) => {
      console.log('Clear Country Assignments Error: ' + error.message);
    });
  }

  async assignPlayer(countryId: number, gameId: number, playerId: number): Promise<void> {
    await this.pool.query(assignUserQuery, [countryId, gameId, playerId]).catch((error: Error) => {
      console.log('Assign User Error: ' + error.message);
    });
  }

  async saveLockAssignment(gameId: number, playerId: number): Promise<void> {
    await this.pool.query(lockAssignmentQuery, [gameId, playerId]);
  }

  async saveUnlockAssignment(gameId: number, playerId: number): Promise<void> {
    await this.pool.query(unlockAssignmentQuery, [gameId, playerId]);
  }

  // async getUserAssignments(gameId: number, userId: number): Promise<UserAssignment[]> {
  //   const assignments = await this.pool
  //     .query(getUserGameAssignmentsQuery, [gameId, userId])
  //     .then((queryResult: QueryResult<any>) =>
  //       queryResult.rows.map((result: UserAssignmentResult) => {
  //         return <UserAssignment>{
  //           username: result.username,
  //           assignmentType: result.assignment_type,
  //           countryId: result.country_id ? result.country_id : 0,
  //           countryName: result.country_name,
  //           countryStatus: result.country_status,
  //           nukeTech: result.nuke_range !== null,
  //           blindAdministrators: result.blind_administrators
  //         };
  //       })
  //     )
  //     .catch((error: Error) => {
  //       console.log('getUserAssignments Error: ' + error.message);
  //       return [];
  //     });

  //   return assignments;
  // }

  async getUserAssignments(gameId: number, userId: number): Promise<UserAssignment[]> {
    const assignments = await this.pool
      .query(getUserGameAssignmentsQuery, [gameId, userId])
      .then((queryResult: QueryResult<any>) =>
        queryResult.rows.map((result: UserAssignmentResult) => {
          return <UserAssignment>{
            username: result.username,
            assignmentType: result.assignment_type,
            assignmentStart: result.assignment_start,
            countryId: result.country_id,
            countryName: result.country_name,
            countryStatus: result.country_status,
            nukeTech: result.nuke_range !== null,
            blindAdministrators: result.blind_administrators
          };
        })
      )
      .catch((error: Error) => {
        console.log('getUserAssignments Error: ' + error.message);
        return [];
      });

    return assignments;
  }

  async getCountryAuthorization(gameId: number, userId: number, countryId: number): Promise<CountryAuthorization> {
    const assignments = await this.pool
      .query(getPlayerIsCountryQuery, [gameId, userId, countryId])
      .then((result: QueryResult<CountryAuthorizationResult>) =>
        result.rows.map((row: CountryAuthorizationResult) => ({
          assigned: row.assigned,
          pendingOrderSetId: row.pending_order_set_id,
          preliminaryOrderSetId: row.preliminary_order_set_id
        }))
      );

    return assignments[0]
      ? assignments[0]
      : { assigned: false, pendingOrderSetId: undefined, preliminaryOrderSetId: undefined };
  }
}
