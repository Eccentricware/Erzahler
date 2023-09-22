import { DecodedIdToken, getAuth, UserRecord } from 'firebase-admin/auth';
import {
  AccountsProviderRow,
  AccountsUserRow,
  AddUserArgs,
  UserProfile
} from '../../models/objects/user-profile-object';
import { db } from '../../database/connection';
import { NewUser } from '../../models/objects/new-user-objects';
import { terminalLog } from '../utils/general';
import { DetailedBoolean } from '../../models/objects/general-objects';

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
    const addUserArgs: AddUserArgs = this.createAddUserArgs(firebaseUser, username);
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

    return await this.addUser(firebaseUser, addUserArgs);
  }

  async addUser(firebaseUser: UserRecord, userArgs: AddUserArgs): Promise<any> {
    const newUser: NewUser = await db.accountsRepo.createAccountUser(userArgs);
    await db.accountsRepo.createEnvironmentUser(newUser);
    await db.accountsRepo.createUserDetails(newUser, userArgs.userStatus);
    await db.accountsRepo.createUserSettings(newUser);

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

  createAddUserArgs(firebaseUser: UserRecord, username: string): AddUserArgs {
    const emailSignup = firebaseUser.providerData[0].providerId === 'password';

    return {
      username: username,
      usernameLocked: emailSignup ? false : true,
      userStatus: emailSignup ? 'unverified' : 'active',
      signupTime: firebaseUser.metadata.creationTime
    };
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
      await db.accountsRepo.syncAccountProviderEmailState(firebaseUser);
      await db.accountsRepo.syncEnvironmentProviderEmailState(firebaseUser);

      const blitzkarteUser: UserProfile | void = await db.accountsRepo.getUserProfile(token.uid);

      if (blitzkarteUser) {
        if (blitzkarteUser.usernameLocked === false && firebaseUser.emailVerified === true) {
          await db.accountsRepo.lockAccountUsername(firebaseUser.uid);
          await db.accountsRepo.lockEnvironmentUsername(firebaseUser.uid);
          await db.accountsRepo.clearAccountVerificationDeadline(firebaseUser.uid);
          await db.accountsRepo.clearEnvironmentVerificationDeadline(firebaseUser.uid);
        }

      } else {
        const accountRestored = await this.restoreAccount(token.uid);
        if (!accountRestored) {
          return { warning: 'No Blitzkarte Account' };
        }

      }

      return blitzkarteUser;
    } else {
      return { error: 'idToken is not valid' };
    }
  }

  async checkAccountExists(uid: string): Promise<DetailedBoolean> {
    const users: AccountsUserRow[] = await db.accountsRepo.getUserRowFromAccounts(uid);

    if (users.length === 1) {
      return {
        value: true,
        result: users[0].userId,
        message: `Firebase UID ${uid} has precisely one account`
      };

    } else if (users.length > 1) {
      terminalLog(`WARNING: Firebase UID ${uid} has ${users.length} instances in the Accounts DB!!`);

      return {
        value: false,
        result: users.length,
        message: `Firebase UID ${uid} has ${users.length} accounts!`,
        alert: true
      };

    } else {
      return {
        value: false,
        result: users.length,
        message: `Firebase UID ${uid} is not in accounts DB!`
      };
    }
  }

  async restoreAccount(uid: string): Promise<UserProfile | any> {
    const users: AccountsUserRow[] = await db.accountsRepo.getUserRowFromAccounts(uid);

    if (users.length === 1) {
      const user = users[0];

      const accountProviders: AccountsProviderRow[] = await db.accountsRepo.getProviderRowFromAccountsByUserId(
        user.userId
      );
      const envProviders: number[] = await db.accountsRepo.getProviderRowFromEnvironmentByUserId(user.userId);
      const missingProviders: AccountsProviderRow[] = accountProviders.filter(
        (provider: AccountsProviderRow) => !envProviders.includes(provider.providerId)
      );

      const success = await db.accountsRepo.createEnvironmentUser(user);
      if (success) {
        await db.accountsRepo.insertProvidersFromBackup(missingProviders);
        await db.accountsRepo.createUserDetails(user, 'active');
        await db.accountsRepo.createUserSettings(user);
      }
      return true;
    } else {
      return false;
    }
  }

  async addAdditionalProvider(oldIdToken: string, newIdToken: string): Promise<any> {
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
          return {
            username: user.username,
            providerType: firebaseUser.providerData[0].providerId
          };
        } else {
          console.log('Add Additional Provider Error: Provider in Database');
        }
      }
    }
  }

  async updateUserSettings(idToken: string, data: any): Promise<any> {
    const token = await this.validateToken(idToken);

    if (token.uid) {
      const blitzkarteUser: UserProfile = await this.getUserProfile(idToken);
      return db.accountsRepo.updatePlayerSettings(
        data.timeZone,
        data.meridiemTime,
        blitzkarteUser.userId,
        blitzkarteUser.username
      );
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
