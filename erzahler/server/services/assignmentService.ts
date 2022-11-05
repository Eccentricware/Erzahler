import { Pool, } from "pg";
import { getPlayerRegistrationStatus } from "../../database/queries/assignments/get-player-registration-status";
import { registerUserQuery } from "../../database/queries/assignments/register-user-query";
import { unregisterUserQuery } from "../../database/queries/assignments/unregister-user-query";
import { updateUserAssignmentQuery } from "../../database/queries/assignments/update-user-assignment-query";
import { victorCredentials } from "../../secrets/dbCredentials";
import { AccountService } from "./accountService";

export class AssignmentService {
  user: any = undefined;

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

      const existingAssignment = userAssignmentTypes.filter((assignment: any) => {
        return assignment.assignment_type === assignmentType;
      });
      if (existingAssignment.length === 0) {
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