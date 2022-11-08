import { Pool, QueryResult, } from "pg";
import { getPlayerRegistrationStatus } from "../../database/queries/assignments/get-player-registration-status";
import { registerUserQuery } from "../../database/queries/assignments/register-user-query";
import { unregisterUserQuery } from "../../database/queries/assignments/unregister-user-query";
import { reregisterUserQuery } from "../../database/queries/assignments/reregister-user-query";
import { getAssignmentsQuery } from "../../database/queries/game/get-assignments-query";
import { getRegisteredPlayersQuery } from "../../database/queries/game/get-registered-players-query";
import { AssignmentStatus } from "../../models/enumeration/assignment-status-enum";
import { AssignmentDataObject } from "../../models/objects/assignment-data-object";
import { victorCredentials } from "../../secrets/dbCredentials";
import { AccountService } from "./accountService";
import { FormattingService } from "./formattingService";
import { getGameAdminsQuery } from "../../database/queries/game/get-game-admins-query";
import { clearCountryAssignmentsQuery } from "../../database/queries/assignments/clear-country-assignments-query";
import { assignUserQuery } from "../../database/queries/assignments/assign-user-query";
import { AssignmentType } from "../../models/enumeration/assignment-type-enum";
import { getGameDetailsQuery } from "../../database/queries/game/get-game-details-query";
import { GameDetailsBuilder } from "../../models/classes/game-details-builder";

export class AssignmentService {
  user: any = undefined;
  adminRoles = [AssignmentType.ADMINISTRATOR, AssignmentType.CREATOR];

  async getGameAssignments(idToken: string, gameId: number): Promise<any> {
    const accountService: AccountService = new AccountService();
    const formattingService: FormattingService = new FormattingService();
    const pool: Pool = new Pool(victorCredentials);
    let userId = 0;

    if (idToken) {
      this.user = await accountService.getUserProfile(idToken);
      console.log('this.user', this.user);
      if (!this.user.error) {
        userId = this.user.userId;
      }
    }

    console.log(`Get Game Assignments: idToken (${idToken ? true : false}) gameId ${gameId} and userId: ${userId}`);

    const gameData: any = await pool.query(getGameDetailsQuery, [gameId, userId, 'America/Los_Angeles'])
      .then((gameDataResults: any) => {
        return new GameDetailsBuilder(gameDataResults.rows[0], 'America/Los_Angeles', true);
      })
      .catch((error: Error) => console.log('Get Game Data Results Error: ' + error.message));

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

    const userIsAdmin: boolean = await this.isPlayerAdmin(gameId, userId);

    const assignmentData: AssignmentDataObject = {
      assignments: assignments,
      registrants: registeredUsers,
      userStatus: userStatus,
      userIsAdmin: userIsAdmin,
      allAssigned: assignments.filter((assignment: any) => assignment.playerId === null).length === 0,
      partialRosterStart: gameData.partialRosterStart,
      finalReadinessCheck: gameData.finalReadinessCheck
    };

    return assignmentData;
  }

  async addUserAssignment(idToken: string, gameId: number, assignmentType: string) {
    const accountService: AccountService = new AccountService();
    const pool = new Pool(victorCredentials);
    console.log('gameId', gameId, 'assignmentType', assignmentType, 'userId', this.user.userId);

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
          gameId,
          this.user.userId,
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
        return await pool.query(reregisterUserQuery, [
          gameId,
          this.user.userId,
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
    console.log('gameId', gameId);
    console.log('assignmentType', assignmentType);
    console.log('userId', this.user);
    const accountService: AccountService = new AccountService();
    const pool = new Pool(victorCredentials);

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      return await pool.query(unregisterUserQuery, [
        gameId,
        this.user.userId,
        assignmentType
      ])
      .then(() => { return {success: true }; })
      .catch((error: Error) => { console.log('Unregister User Error: ' + error.message); });
    }
  }

  async assignPlayer(idToken: string, gameId: number, playerId: number, countryId: number) {
    const accountService: AccountService = new AccountService();
    const pool = new Pool(victorCredentials);

    console.log(`idToken (${idToken ? true : false}) gameId (${gameId}) playerId (${playerId}) countryId (${countryId})`);

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      const requestFromAdmin = await this.isPlayerAdmin(gameId, this.user.userId);

      if (requestFromAdmin) {
        await pool.query(clearCountryAssignmentsQuery, [gameId, countryId])
          .catch((error: Error) => { console.log('Clear Country Assignments Error: ' + error.message)});

        if (playerId > 0) {
          await pool.query(assignUserQuery, [
            countryId,
            gameId,
            playerId
          ])
          .catch((error: Error) => { console.log('Assign User Error: ' + error.message)});
        }
      }
    } else {
      return {
        success: false,
        error: 'Invalid user'
      }
    }
  }

  async isPlayerAdmin(gameId: number, playerId: number): Promise<boolean> {
    const pool = new Pool(victorCredentials);

    const gameAdmins = await pool.query(getGameAdminsQuery, [gameId])
      .then((results: QueryResult) => results.rows )
      .catch((error: Error) => {
        console.log('Get Game Admins Query Error: ' + error.message);
        return [];
      });

    const playerAdmin = gameAdmins.filter((admin: any) => admin.user_id === playerId);
    return playerAdmin.length > 0;
  }
}