import { DecodedIdToken, getAuth, UserRecord } from 'firebase-admin/auth';
import { AccountsProviderRow, AccountsUserRow, UserProfile } from '../../models/objects/user-profile-object';
import { FormattingService } from './formattingService';
import { db } from '../../database/connection';
import { NewUser } from '../../models/objects/new-user-objects';

export class AccountService {
  async validateToken(idToken: string, stillLoggedIn?: boolean): Promise<any> {
    const checkRevoked = stillLoggedIn === undefined ? true : stillLoggedIn;
    return getAuth()
      .verifyIdToken(idToken, checkRevoked)
      .then((decodedIdToken: DecodedIdToken) => {
        return {
          uid: decodedIdToken.uid,
          valid: true
        };
      })
      .catch((error: Error) => {
        console.log(error.message);
        return {
          uid: 0,
          valid: false
        };
      });
  }

  async attemptAddUserToDatabase(idToken: string, username: string): Promise<any> {
    const token: any = await this.validateToken(idToken);
    const usernameAvailable: boolean = await db.accountsRepo.checkUsernameAvailable(username);

    if (token.uid && usernameAvailable) {
      const firebaseUser = await this.getFirebaseUser(token.uid);
      const addUserResult: any = await this.addUserToDatabase(firebaseUser, username);
      console.log('Add User Result', addUserResult);
      return addUserResult;
    }
  }

  async addUserToDatabase(firebaseUser: UserRecord, username: string): Promise<any> {
    const addUserArgs: any[] = this.createAddUserArgs(firebaseUser, username);
    if (firebaseUser.providerData[0].providerId === 'password') {
      await getAuth()
        .updateUser(firebaseUser.uid, {
          displayName: username
        })
        .then(() => {
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
    const newUser: NewUser = await db.accountsRepo.createAccountUser(providerDependentArgs);
    await db.accountsRepo.createEnvironmentUser(newUser);

    const providerArgs = this.createProviderArgs(newUser.userId, firebaseUser);

    const newProviderId = await db.accountsRepo.createAccountProvider(providerArgs);
    providerArgs.unshift(newProviderId);
    await db.accountsRepo.createEnvironmentProvider(providerArgs);

    const userAdded = await db.accountsRepo.getUserProfile(firebaseUser.uid);

    if (userAdded) {
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
    const verificationDeadline: Date = new Date(Date.now() + 3600000);

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
    const token: DecodedIdToken = await this.validateToken(idToken);

    if (token.uid) {
      const firebaseUser: UserRecord = await this.getFirebaseUser(token.uid);
      await db.accountsRepo.syncProviderEmailState(firebaseUser);

      const blitzkarteUser: UserProfile | void = await db.accountsRepo.getUserProfile(token.uid);

      if (blitzkarteUser) {
        if (blitzkarteUser.usernameLocked === false && firebaseUser.emailVerified === true) {
          await db.accountsRepo.lockUsername(firebaseUser.uid);
          await db.accountsRepo.clearVerificationDeadline(firebaseUser.uid);
        }
      } else {
        await this.restoreAccount(token.uid);

        const blitzkarteUser: UserProfile | void = await db.accountsRepo.getUserProfile(token.uid);
        return blitzkarteUser;
      }

      return blitzkarteUser;
    } else {
      return { error: 'idToken is not valid' };
    }
  }

  async restoreAccount(uid: string): Promise<UserProfile | any> {
    const users: AccountsUserRow[] = await db.accountsRepo.getUserRowFromAccounts(uid);
    if (users.length > 0) {
      const user = users[0];

      const providers: AccountsProviderRow[] = await db.accountsRepo.getProviderRowFromAccountsByUserId(user.userId);

      const userId = await db.accountsRepo.insertUserFromBackup(user);
      if (userId > 0) {
        await db.accountsRepo.insertProvidersFromBackup(providers);
      }
    } else {
      console.log('Firebase UID does not exist in accounts DB. How did you pull that off?');
    }
  }

  async addAdditionalProvider(oldIdToken: string, newIdToken: string) {
    const decodedOldToken: DecodedIdToken = await this.validateToken(oldIdToken, false);
    const decodedNewToken: DecodedIdToken = await this.validateToken(newIdToken, true);

    if (decodedOldToken.uid) {
      const user: UserProfile | void = await db.accountsRepo.getUserProfile(decodedOldToken.uid);

      if (user) {
        const providerInDB: any = await db.accountsRepo.checkProviderInDB(decodedNewToken.uid);
        const firebaseUser: UserRecord = await this.getFirebaseUser(decodedNewToken.uid);

        if (!providerInDB) {
          const providerArgs: any = this.createProviderArgs(user.userId, firebaseUser);
          const newProviderId = await db.accountsRepo.createAccountProvider(providerArgs);
          providerArgs.unshift(newProviderId);
          await db.accountsRepo.createEnvironmentProvider(providerArgs);
        } else {
          console.log('Add Additional Provider Error: Provider in Database');
        }

      }

    }
  }

  async updateUserSettings(idToken: string, data: any) {
    const token = await this.validateToken(idToken);

    if (token.uid) {
      const blitzkarteUser: UserProfile = await this.getUserProfile(idToken);
      return db.accountsRepo.updatePlayerSettings(data.timeZone, data.meridiemTime, blitzkarteUser.userId);
    }
  }

  async getUserIdFromToken(idToken: string): Promise<number> {
    const token = await this.validateToken(idToken);
    let userId = 0;

    if (token.uid) {
      const user: UserProfile | void = await db.accountsRepo.getUserProfile(token.uid);
      userId = user ? user.userId : 0;
    }

    return userId;
  }
}
