import { DecodedIdToken } from "firebase-admin/auth";
import { Pool } from "pg";
import { getPlayerRegistrationStatus } from "../../database/queries/assignments/get-player-registration-status";
import { victorCredentials } from "../../secrets/dbCredentials";
import { AccountService } from "./accountService";

export class AssignmentService {
  user: any = undefined;

  async addPlayerAssignment(idToken: string, gameId: number, assignmentType: string) {
    const accountService: AccountService = new AccountService();
    const pool = new Pool(victorCredentials);

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      const userAssignmentTypes = await pool.query(getPlayerRegistrationStatus, [this.user.userId]);
      const existingAssignment = userAssignmentTypes.rows.filter((assignment: any) => {
        return assignment.assignmentType === assignmentType;
      });
    }
  }
}