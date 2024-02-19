import { Pool } from 'pg';
import { AssignmentStatus } from '../../models/enumeration/assignment-status-enum';
import { Assignment, AssignmentDataObject } from '../../models/objects/assignment-objects';
import { envCredentials } from '../../secrets/dbCredentials';
import { AccountService } from './account-service';
import { AssignmentType } from '../../models/enumeration/assignment-type-enum';
import { db } from '../../database/connection';
import { terminalAddendum, terminalLog } from '../utils/general';

export class AssignmentService {
  user: any = undefined;
  adminRoles = [AssignmentType.ADMINISTRATOR, AssignmentType.CREATOR];

  async getGameAssignments(idToken: string, gameId: number): Promise<any> {
    const accountService: AccountService = new AccountService();
    let userId = 0;

    if (idToken) {
      this.user = await accountService.getUserProfile(idToken);
      // console.log('this.user', this.user);
      if (!this.user.error) {
        userId = this.user.userId;
      }
    }

    const gameData: any = await db.gameRepo.getGameDetails(
      gameId,
      userId,
      this.user.timeZone ? this.user.timeZone : 'America/Los_Angeles',
      this.user.meridiemTime
    );
    const assignments: any = await db.assignmentRepo.getAssignments(gameId, userId);
    const registeredUsers: Assignment[] = await db.assignmentRepo.getUserRegistrations(gameId);

    const userStatus: Assignment[] = registeredUsers.filter((assignment: Assignment) =>
      assignment.userId === userId
    );
    const userIsAdmin: Assignment[] = userStatus.filter((assignment: Assignment) =>
      this.adminRoles.includes(assignment.assignmentType)
    );

    const assignmentData: AssignmentDataObject = {
      gameId: gameId,
      assignments: assignments,
      registrants: registeredUsers,
      userStatus: userStatus,
      userIsAdmin: userIsAdmin.length > 0,
      allAssigned: assignments.filter((assignment: any) => assignment.playerId === null).length === 0,
      partialRosterStart: gameData.partialRosterStart,
      finalReadinessCheck: gameData.finalReadinessCheck
    };

    return assignmentData;
  }

  /**
   * This thing is so dep
   *
   * @param gameId
   * @param playerId
   * @returns
   */
  async isPlayerAdmin(gameId: number, playerId: number): Promise<boolean> {
    const pool = new Pool(envCredentials);

    const gameAdmins = await db.assignmentRepo.getGameAdmins(gameId);

    const playerAdmin = gameAdmins.filter((admin: any) => admin.user_id === playerId);
    return playerAdmin.length > 0;
  }

  async registerUser(idToken: string, gameId: number, assignmentType: string) {
    const accountService: AccountService = new AccountService();

    const user = await accountService.getUserProfile(idToken);
    if (user) {
      terminalLog(`Registering ${user.username} (${user.userId}) as ${assignmentType} for game ${gameId}`);
      const userAssignments = await db.assignmentRepo.getUserRegistrations(gameId, user.userId);

      // Users wouldn't be banned as an admin at a per-game level. This would have to be set/get elsewhere.
      //
      const existingAssignment = this.getUserAssignment(userAssignments, AssignmentType.PLAYER);

      const blockedStatuses = [AssignmentStatus.BANNED];

      // Users can't be banned if the assignment doesn't exist
      if (!existingAssignment) {
        return await db.assignmentRepo.saveRegisterUser(gameId, user.userId, assignmentType);
      } else {
        terminalAddendum('Registration', `${user.username} is already signed up as a ${assignmentType} for game (${gameId})`);
        return {
          success: false,
          message: `${user.username} is already signed up as a ${assignmentType} for game (${gameId})`
        };
      }
    }

    return {
      success: false,
      message: 'Invalid user'
    };
  }

  getUserAssignment(userAssignments: Assignment[], assignmentType: AssignmentType): Assignment | undefined {
    const assignmentsOfType = userAssignments.filter((assignment: Assignment) => {
      return assignment.assignmentType === assignmentType;
    });

    if (assignmentsOfType.length > 1) {
      terminalAddendum(
        'Assignments',
        `Player has been registered as a ${
          assignmentType
        } ${
          assignmentsOfType.length
        } time${
          assignmentsOfType.length === 1 ? '' : 's'
        }`);
    }

    if (assignmentsOfType.length > 0) {
      return assignmentsOfType[0];
    }

    return undefined;
  }

  async unregisterUser(idToken: string, gameId: number, assignmentType: string) {
    terminalLog(`Unregistering ${this.user.username} (${this.user.userId}) as ${assignmentType} for game ${gameId}`);
    const accountService: AccountService = new AccountService();
    const pool = new Pool(envCredentials);

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      return await db.assignmentRepo.saveUnregisterUser(gameId, this.user.userId, assignmentType);
    }
  }

  async assignPlayer(idToken: string, gameId: number, playerId: number, countryId: number) {
    const accountService: AccountService = new AccountService();
    const pool = new Pool(envCredentials);

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      const requestFromAdmin = await this.isPlayerAdmin(gameId, this.user.userId);

      if (requestFromAdmin) {
        await db.assignmentRepo.clearCountryAssignments(gameId, countryId);

        if (playerId > 0) {
          await db.assignmentRepo.assignPlayer(countryId, gameId, playerId);
        }
      }
    } else {
      return {
        success: false,
        error: 'Invalid user'
      };
    }
  }

  async lockAssignment(idToken: string, gameId: number, playerId: number) {
    const accountService: AccountService = new AccountService();
    const pool = new Pool(envCredentials);

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      const requestFromAdmin = await this.isPlayerAdmin(gameId, this.user.userId);

      if (requestFromAdmin) {
        await db.assignmentRepo.saveLockAssignment(gameId, playerId);
      }
    } else {
      return {
        success: false,
        error: 'Invalid user'
      };
    }
  }

  async unlockAssignment(idToken: string, gameId: number, playerId: number) {
    const accountService: AccountService = new AccountService();
    const pool = new Pool(envCredentials);

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      const requestFromAdmin = await this.isPlayerAdmin(gameId, this.user.userId);

      if (requestFromAdmin) {
        await db.assignmentRepo.saveUnlockAssignment(gameId, playerId);
      }
    } else {
      return {
        success: false,
        error: 'Invalid user'
      };
    }
  }
}
