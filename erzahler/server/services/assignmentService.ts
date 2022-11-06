import { Pool, QueryResult, } from "pg";
import { getPlayerRegistrationStatus } from "../../database/queries/assignments/get-player-registration-status";
import { registerUserQuery } from "../../database/queries/assignments/register-user-query";
import { unregisterUserQuery } from "../../database/queries/assignments/unregister-user-query";
import { updateUserAssignmentQuery } from "../../database/queries/assignments/update-user-assignment-query";
import { getAssignmentsQuery } from "../../database/queries/game/get-assignments-query";
import { getRegisteredPlayersQuery } from "../../database/queries/game/get-registered-players-query";
import { AssignmentStatus } from "../../models/enumeration/assignment-status-enum";
import { AssignmentDataObject } from "../../models/objects/assignment-data-object";
import { victorCredentials } from "../../secrets/dbCredentials";
import { AccountService } from "./accountService";
import { FormattingService } from "./formattingService";

export class AssignmentService {
  user: any = undefined;

  async getGameAssignments(idToken: string, gameId: number): Promise<any> {
    const accountService: AccountService = new AccountService();
    const formattingService: FormattingService = new FormattingService();
    const pool: Pool = new Pool(victorCredentials);
    let userId = 0;

    if (idToken) {
      this.user = await accountService.getUserProfile(idToken);
      if (!this.user.error) {
        userId = this.user.userId;
      }
    }

    const assignments: any = await pool.query(getAssignmentsQuery, [gameId, userId])
      .then((assignmentDataResults: QueryResult<any>) => {
        return assignmentDataResults.rows.map((assignment: any) => formattingService.convertKeysSnakeToCamel(assignment));
      })
      .catch((error: Error) => console.log('Get Assignment Data Results Error: ' + error.message));

    const registeredUsers: any = await pool.query(getRegisteredPlayersQuery, [gameId])
      .then((registeredUserResults: QueryResult<any>) => {
        return registeredUserResults.rows.map((player: any) => formattingService.convertKeysSnakeToCamel(player));
      })
      .catch((error: Error) => console.log('Get Registered Player Data Results Error: ' + error.message));

    const userStatus: any = await pool.query(getPlayerRegistrationStatus, [gameId, userId])
      .then((playerRegistrationResults: QueryResult<any>) => {
        return playerRegistrationResults.rows.map((registrationType: any) => formattingService.convertKeysSnakeToCamel(registrationType));
      })
      .catch((error: Error) => console.log('Get Player Registration Types Results Error: ' + error.message));

    const assignmentData: AssignmentDataObject = {
      assignments: assignments,
      registrants: registeredUsers,
      userStatus: userStatus
    };

    return assignmentData;
  }

  async addUserAssignment(idToken: string, gameId: number, assignmentType: string) {
    const accountService: AccountService = new AccountService();
    const pool = new Pool(victorCredentials);

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      const userAssignmentTypes = await pool.query(getPlayerRegistrationStatus, [
        gameId,
        this.user.userId
      ])
      .then((results: any) => { return results.rows})
      .catch((error: Error) => console.log('Get Player Registration Status Error: ' + error.message));

      const blockedStatuses = [AssignmentStatus.BANNED];

      const existingAssignment = userAssignmentTypes.filter((assignment: any) => {
        return assignment.assignment_type === assignmentType;
      });
      if (existingAssignment.length === 0 && !blockedStatuses.includes(existingAssignment.assignment_type)) {
        return await pool.query(registerUserQuery, [
          this.user.userId,
          gameId,
          assignmentType
        ])
        .then(() => { return {success: true }; })
        .catch((error: Error) => {
          console.log('Insert assignment error: ' + error.message);
          return {
            success: false,
            message: error.message
          }
        });
      } else if (existingAssignment[0].assignment_end !== null) {
        return await pool.query(updateUserAssignmentQuery, [
          null,
          new Date().toUTCString(),
          null,
          'Registered',
          this.user.userId,
          gameId,
          assignmentType
        ])
        .then(() => { return {success: true }; })
        .catch((error: Error) => {
          console.log('Update assignment error: ' + error.message);
          return {
            success: false,
            message: error.message
          }
        });
      } else {
        console.log(`User is already registered as ${assignmentType}`);
        return {
          success: undefined,
          message: `User is already registered as ${assignmentType}`
        }
      }
    }

    return {
      success: false,
      message: 'Invalid user'
    }
  }

  async removeUserAssignment(idToken: string, gameId: number, assignmentType: string) {
    const accountService: AccountService = new AccountService();
    const pool = new Pool(victorCredentials);
    console.log('gameId', gameId, 'assignmentType', assignmentType, 'userId', this.user.userId);

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      return await pool.query(unregisterUserQuery, [
        this.user.userId,
        gameId,
        assignmentType
      ])
      .then(() => { return {success: true }; })
      .catch((error: Error) => { console.log('Unregister User Error: ' + error.message); });
    }
  }
}