import { Pool } from 'pg';
import { AssignmentStatus } from '../../models/enumeration/assignment-status-enum';
import { AssignmentDataObject } from '../../models/objects/assignment-objects';
import { envCredentials } from '../../secrets/dbCredentials';
import { AccountService } from './account-service';
import { AssignmentType } from '../../models/enumeration/assignment-type-enum';
import { db } from '../../database/connection';
import { terminalLog } from '../utils/general';

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
      'America/Los_Angeles',
      this.user.meridiemTime
    );
    const assignments: any = await db.assignmentRepo.getAssignments(gameId, userId);
    const registeredUsers: any = await db.assignmentRepo.getRegisteredPlayers(gameId);
    const userStatus: any = await db.assignmentRepo.getPlayerRegistrationStatus(gameId, userId);
    const userIsAdmin: boolean = await this.isPlayerAdmin(gameId, userId);

    const assignmentData: AssignmentDataObject = {
      gameId: gameId,
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
      const userAssignmentTypes = await db.assignmentRepo.getPlayerRegistrationStatus(gameId, user.userId);

      const blockedStatuses = [AssignmentStatus.BANNED];

      const existingAssignment = userAssignmentTypes.filter((assignment: any) => {
        return assignment.assignment_type === assignmentType;
      });

      if (existingAssignment.length === 0 && !blockedStatuses.includes(existingAssignment.assignment_type)) {
        return await db.assignmentRepo.saveRegisterUser(gameId, user.userId, assignmentType);
      } else if (existingAssignment[0].assignment_end !== null) {
        return await db.assignmentRepo.saveReregisterUser(gameId, user.userId, assignmentType);
      } else {
        console.log(`User is already registered as ${assignmentType}`);
        return {
          success: undefined,
          message: `User is already registered as ${assignmentType}`
        };
      }
    }

    return {
      success: false,
      message: 'Invalid user'
    };
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
