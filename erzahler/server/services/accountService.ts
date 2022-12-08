import { Pool } from 'pg';
import { getUserIdQuery } from '../../database/queries/accounts/get-user-id-query';
import { victorCredentials } from '../../secrets/dbCredentials';
import { DecodedIdToken, getAuth, UserRecord } from 'firebase-admin/auth'
import { createUserQuery } from '../../database/queries/accounts/create-user-query';
import { getUserProfileQuery } from '../../database/queries/dashboard/get-user-profile-query';
import { getExistingProviderQuery } from '../../database/queries/accounts/get-existing-provider-query';
import { createProviderQuery } from '../../database/queries/accounts/create-provider-query';
import { syncProviderEmailStateQuery } from '../../database/queries/accounts/sync-provider-email-state-query';
import { lockUsernameQuery } from '../../database/queries/accounts/lock-username-query';
import { clearVerficiationDeadlineQuery } from '../../database/queries/accounts/clear-verification-deadline-query';
import { UserProfile } from '../../models/objects/user-profile-object';
import { FormattingService } from './formattingService';
import { updatePlayerSettings } from '../../database/queries/dashboard/update-user-query';
import { db } from '../../database/connection';

export class AccountService {
  async validateToken(idToken: string): Promise<any> {
    return getAuth()
      .verifyIdToken(idToken, true)
      .then((decodedIdToken: DecodedIdToken) => {
        return {
          uid: decodedIdToken.uid,
          valid: true
        };
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  }

  async attemptAddUserToDatabase(idToken: string, username: string): Promise<any> {
    const token: DecodedIdToken = await this.validateToken(idToken);
    const usernameAvailable: boolean = await db.accountsRepo.checkUsernameAvailable(username);

    if (token.uid && usernameAvailable) {
      const firebaseUser = await this.getFirebaseUser(token.uid);
      const addUserResult: any = await this.addUserToDatabase(firebaseUser, username);
      console.log('Add User Result', addUserResult)
      return addUserResult;
    }
  }

  async addUserToDatabase(
    firebaseUser: UserRecord,
    username: string,
  ): Promise<any> {
    const addUserArgs: any[] = this.createAddUserArgs(firebaseUser, username);
    if (firebaseUser.providerData[0].providerId === 'password') {

      await getAuth()
        .updateUser(firebaseUser.uid, {
          displayName: username
        })
        .then((user: UserRecord) => {
          return { success: true };
        })
        .catch((error: Error) => {
          return {
            success: false,
            error: error.message
          };
        });
    }

    return await this.addUser(firebaseUser, username, addUserArgs);
  }

  async addUser(firebaseUser: UserRecord, username: string, providerDependentArgs: any[]): Promise<any> {
    await db.accountsRepo.createUser(providerDependentArgs);

    const userId: number = await db.accountsRepo.getUserId(username);
    const providerArgs = this.createProviderArgs(userId, firebaseUser);

    await db.accountsRepo.createProvider(providerArgs);

    const userAdded = await db.accountsRepo.getUserProfile(firebaseUser.uid);

    console.log('userAdded rowcount', userAdded.rowCount);

    if (userAdded.rowCount === 1) {
      return { success: true };
    } else {
      return { success: false };
    }
  }

  createAddUserArgs(firebaseUser: UserRecord, username: string): any[] {
    const emailSignup = firebaseUser.providerData[0].providerId === 'password';

    return [
      username,
      emailSignup ? false : true,
      emailSignup ? 'unverified' : 'active',
      firebaseUser.metadata.creationTime,
      firebaseUser.metadata.lastSignInTime,
      'America/Los_Angeles'
    ];
  }

  createProviderArgs(userId: number, firebaseUser: UserRecord): any[] {
    const emailSignup = firebaseUser.providerData[0].providerId === 'password';
    let verificationDeadline: Date = new Date(Date.now() + 3600000)

    return [
      userId,
      firebaseUser.uid,
      firebaseUser.providerData[0].providerId,
      firebaseUser.displayName,
      firebaseUser.email,
      firebaseUser.emailVerified,
      emailSignup ? verificationDeadline : null,
      firebaseUser.metadata.creationTime,
      firebaseUser.metadata.lastSignInTime,
      firebaseUser.photoURL
    ];
  }

  async getFirebaseUser(uid: string): Promise<any> {
    return getAuth()
      .getUser(uid)
      .then((user: any) => {
        return user;
      })
      .catch((error: Error) => {
        return error.message;
      });
  }

  /**
   * Returns the User profile given an unforgable idToken
   * @param idToken
   * @returns Promise<UserProfile | any>
   */
  async getUserProfile(idToken: string): Promise<UserProfile | any> {
    const formattingService: FormattingService = new FormattingService();
    const token: DecodedIdToken = await this.validateToken(idToken);

    if (token.uid) {


      const firebaseUser: UserRecord = await this.getFirebaseUser(token.uid);
      await db.accountsRepo.syncProviderEmailState(firebaseUser);

      const blitzkarteUser: UserProfile = await db.accountsRepo.getUserProfile(token.uid);

      if (blitzkarteUser.usernameLocked === false && firebaseUser.emailVerified === true) {
        await db.accountsRepo.lockUsername(firebaseUser.uid);
        await db.accountsRepo.clearVerificationDeadline(firebaseUser.uid);
      }

      return blitzkarteUser;
    } else {
      return { error: 'idToken is not valid' };
    }
  }

  async addAdditionalProvider(idToken: string, username: string) {
    const token: DecodedIdToken = await this.validateToken(idToken);

    if (token.uid) {
      const firebaseUser: UserRecord = await this.getFirebaseUser(token.uid);
      const providerInDB: any = await db.accountsRepo.checkProviderInDB(token.uid, username);

      if (!providerInDB) {
        const userId: number = await db.accountsRepo.getUserId(username);
        const providerArgs: any = this.createProviderArgs(userId, firebaseUser);
        await db.accountsRepo.createProvider(providerArgs);
      } else {
        console.log('Provider in Database');
      }
    }
  }

  async updateUserSettings(idToken: string, data: any) {
    const token = await this.validateToken(idToken);

    if (token.uid) {
      const pool = new Pool(victorCredentials);

      const blitzkarteUser: UserProfile = await this.getUserProfile(idToken);
      return db.accountsRepo.updatePlayerSettings(
        data.timeZone,
        data.meridiemTime,
        blitzkarteUser.userId
      )
    }
  }
}
