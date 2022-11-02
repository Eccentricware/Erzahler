import { Pool, QueryArrayResult } from "pg";
import { getPlayerRegistrationStatus } from "../../database/queries/assignments/get-player-registration-status";
import { registerUserQuery } from "../../database/queries/assignments/register-user-query";
import { updateUserAssignmentQuery } from "../../database/queries/assignments/update-user-assignment-query";
import { victorCredentials } from "../../secrets/dbCredentials";
import { AccountService } from "./accountService";

export class AssignmentService {
  user: any = undefined;

  async addPlayerAssignment(idToken: string, gameId: number, assignmentType: string) {
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
      console.log('Assignment Rows', userAssignmentTypes);
      const existingAssignment = userAssignmentTypes.filter((assignment: any) => {
        return assignment.assignment_type === assignmentType;
      });
      console.log('Existing Assignment Rows', existingAssignment.length);
      console.log('userId', this.user.userId);
      console.log('gameId', gameId);
      console.log('assignmentType', assignmentType);
      if (existingAssignment.length === 0) {
        await pool.query(registerUserQuery, [
          this.user.userId,
          gameId,
          assignmentType,
          'Active'
        ])
        .catch((error: Error) => {
          console.log('Insert assignment error: ' + error.message);
        });
      } else if (existingAssignment[0].assignment_end !== null) {
        await pool.query(updateUserAssignmentQuery, [
          null,
          Date.now(),
          null,
          'Registered',
          this.user.userId
        ])
        .catch((error: Error) => {
          console.log('Update assignment error: ' + error.message);
        });
      } else {
        console.log(`User is already registered as ${assignmentType}`);
      }
    }
  }
}