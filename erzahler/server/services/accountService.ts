import { Pool } from 'pg';
import { getUsernameQuery } from '../../database/queries/accounts/get-username-query';
import { victorCredentials } from '../../secrets/dbCredentials';
import { getAuth, UserRecord } from 'firebase-admin/auth'
import { createUserQuery } from '../../database/queries/accounts/create-user-query';
import { getUserProfileQuery } from '../../database/queries/dashboard/get-user-profile-query';
import { createProviderQuery } from '../../database/queries/accounts/create-provider-query';
import { syncProviderEmailStateQuery } from '../../database/queries/accounts/sync-provider-email-state-query';
import { lockUsernameQuery } from '../../database/queries/accounts/lock-username-query';
import { clearVerficiationDeadlineQuery } from '../../database/queries/accounts/clear-verification-deadline-query';

export class AccountService {
  async checkUsernameAvailable(username: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(getUsernameQuery, [username])
      .then((usernameCountResponse: any) => {
        if (usernameCountResponse.rows.length === 0) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error: Error) => console.error(error.message));
  }

  async validateToken(idToken: string): Promise<any> {
    return getAuth()
      .verifyIdToken(idToken, true)
      .then((user: any) => {
        return {
          uid: user.uid,
          valid: true
        };
      })
      .catch((error: Error) => {
        return {
          error: error.message,
          valid: false
        }
      });
  }

  async attemptAddUserToDatabase(idToken: string, username: string): Promise<any> {
    const token = await this.validateToken(idToken);
    const usernameAvailable = await this.checkUsernameAvailable(username);

    if (token.valid && usernameAvailable) {
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

    return await this.runAddUserQuery(firebaseUser, username, addUserArgs);
  }

  async runAddUserQuery(firebaseUser: UserRecord, username: string, providerDependentArgs: any[]): Promise<any> {
    const pool = new Pool(victorCredentials);
    let returnedError: string = '';

    await pool.query(createUserQuery, providerDependentArgs)
      .then((result: any) => { console.log(`Add user success:`, Boolean(result.rowCount)); })
      .catch((error: Error) => {
        console.log('Create User Query Error:', error.message);
      });

    const userId = await this.getUserId(username);
    const createProviderArgs = this.createProviderArgs(userId, firebaseUser);

    await pool.query(createProviderQuery, createProviderArgs)
      .then((result: any) => {console.log(`Provider added`, result); })
      .catch((error: Error) => {
        console.log('Create Provider Query Error:', error.message);
      });

    const userAdded = await pool.query(getUserProfileQuery, [firebaseUser.uid])
      .then((result: any) => result )
      .catch((error: Error) => {
        console.log('User Added Query Error', error.message);
      });

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
      firebaseUser.metadata.lastSignInTime
    ];
  }

  createProviderArgs(userId: string, firebaseUser: UserRecord): any[] {
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

  async getUserId(username: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(getUsernameQuery, [username])
      .then((userResult: any) => {
        return userResult.rows[0].user_id;
      })
      .catch((error: Error) => console.error(error.message));
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

  async getUserProfile(idToken: string): Promise<any> {
    const token: any = await this.validateToken(idToken);

    if (token.valid) {
      const pool = new Pool(victorCredentials);

      const firebaseUser: UserRecord = await this.getFirebaseUser(token.uid);
      await pool.query(syncProviderEmailStateQuery, [
        firebaseUser.email,
        firebaseUser.emailVerified,
        firebaseUser.metadata.lastSignInTime,
        firebaseUser.uid
      ]);

      const blitzkarteUser = await pool.query(getUserProfileQuery, [token.uid])
        .then((result: any) => result.rows[0])
        .catch((error: Error) => console.log('User Profile Query Error:', error.message));

      if (blitzkarteUser.username_locked === false && firebaseUser.emailVerified === true) {
        await pool.query(lockUsernameQuery, [firebaseUser.uid])
          .then((result: any) => { console.log('Username Locked'); })
          .catch((error: Error) => { console.log(error.message); });
        await pool.query(clearVerficiationDeadlineQuery, [firebaseUser.uid])
          .then((result: any) => { console.log('Timer disabled'); })
          .catch((error: Error) => { console.log(error.message); });
      }

      return blitzkarteUser;
    } else {
      return { error: 'idToken is not valid' };
    }
  }
}
