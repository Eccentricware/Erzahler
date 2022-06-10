import { Pool } from 'pg';
import { getUserEmailQuery } from '../../database/queries/accounts/get-user-email-query';
import { getUsernameQuery } from '../../database/queries/accounts/get-username-query';
import { victorCredentials } from '../../secrets/dbCredentials';
import { getAuth, UserRecord } from 'firebase-admin/auth'
import { createUserQuery } from '../../database/queries/accounts/create-user-query';
import { createProviderQuery } from '../../database/queries/accounts/create-provider-query';
import { getUserProfileQuery } from '../../database/queries/dashboard/get-user-profile-query';
import { getUserWithEmailProviderQuery } from '../../database/queries/accounts/get-user-with-email-provider-query';
import { validateUserEmailQuery } from '../../database/queries/accounts/validate-user-email-query';
import { validateProviderEmailQuery } from '../../database/queries/accounts/validate-provider-email-query';
import { updateProviderEmailQuery } from '../../database/queries/accounts/update-provider-email-query';
import { updateUserEmailQuery } from '../../database/queries/accounts/update-user-email-query';
import { error } from 'console';

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

  async validateUser(idToken: string): Promise<any> {
    return getAuth()
      .verifyIdToken(idToken, true)
      .then((user: any) => {
        return {
          uid: user.uid,
          valid: true
        };
      })
      .catch((error: Error) => {
        return { valid: false };
      });
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
          error: error.message
        }
      });
  }

  async attemptAddUserToDatabase(idToken: string, username: string): Promise<any> {
    const token = await this.validateUser(idToken);
    const usernameAvailable = await this.checkUsernameAvailable(username);

    if (token.valid && usernameAvailable) {
      const firebaseUser = await this.getFirebaseUser(token.uid);
      const addUserResult: any = await this.addUserToDatabase(firebaseUser, username);
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
      .catch((error: Error) => { returnedError = error.message});

    const userId = await this.getUserId(username);
    const createProviderArgs = this.createProviderArgs(userId, firebaseUser);

    await pool.query(createProviderQuery, createProviderArgs).catch((error: Error) => { returnedError = error.message });

    const userAdded = await pool.query(getUserProfileQuery, [username])
      .then((result: any) => result)
      .catch((error: Error) => { returnedError = error.message });

    if (userAdded.rowCount === 1) {
      return { success: true };
    } else {
      return { success: false };
    }
  }

  createAddUserArgs(firebaseUser: UserRecord, username: string): any[] {
    const emailSignup = firebaseUser.providerData[0].providerId === 'password';
    let verificationDeadline: number = Date.now();

    if (emailSignup) {
      verificationDeadline += 3600000;
    }

    return [
      username,
      emailSignup ? false : true,
      emailSignup ? 'unverified' : 'active',
      emailSignup ? firebaseUser.email : null,
      emailSignup ? firebaseUser.emailVerified : null,
      emailSignup ? new Date(verificationDeadline) : null,
      firebaseUser.metadata.creationTime,
      firebaseUser.metadata.lastSignInTime
    ]
  }

  createProviderArgs(userId: string, firebaseUser: UserRecord): any[] {
    return [
      userId,
      firebaseUser.uid,
      firebaseUser.providerData[0].providerId,
      firebaseUser.displayName,
      firebaseUser.email,
      firebaseUser.photoURL,
      firebaseUser.metadata.creationTime,
      firebaseUser.metadata.lastSignInTime
    ];
  }

  async getUserId(username: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(getUsernameQuery, [username])
      .then((userResult: any) => {
        return userResult.rows[0].user_id;
      })
      .catch((e: Error) => console.error(e.message));
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

  async getAuthenticatedUser(idToken: string) {
    return this.validateUser(idToken)
      .then((uid: string) => {
        return this.getFirebaseUser(uid);
      })
      .catch((error: Error) => {
        return {
          error: error.message
        }
      });
  }

  async getUserProfile(idToken: string): Promise<any> {
    const token: any = await this.validateToken(idToken);

    if (token.valid) {
      const pool = new Pool(victorCredentials);
      const userProfile: Promise<any> = pool.query(getUserProfileQuery, [token.uid]);

      return userProfile
      .then((profiles: any) => {
        // console.log('profiles', profiles.rows);
        return profiles.rows;
      })
      .catch((error: Error) => {
        return { error: error.message };
      });
    } else {
      return { error: 'idToken is not valid' };
    }
  }

  async checkProfileAssociated(idToken: string): Promise<any> {
    const token: any = await this.validateToken(idToken);

    if (token.valid) {
      const pool = new Pool(victorCredentials);
      const userProfile: Promise<any> = pool.query(getUserProfileQuery, [token.uid]);

      return userProfile.then((profile: any) => {
        return profile.rows.length;
      }).catch((error: Error) => {
        return error.message;
      });
    }
  }

  async updateUserEmail(idToken: string, newEmail: string) {
    const token: any = await this.validateToken(idToken);

    if (token.valid) {
      const pool = new Pool(victorCredentials);
      const userProfile: Promise<any> = pool.query(getUserProfileQuery, [token.uid]);
      userProfile.then((userData: any) => {
        pool.query(updateUserEmailQuery, [userData.rows[0].user_id])
          .then(() => {
            console.log('User update successful?');
          })
          .catch((error: Error) => {
            console.log('Update failure for sure', error.message);
          });;
      })

      pool.query
      pool.query(updateProviderEmailQuery, [newEmail, token.uid])
        .then(() => {
          console.log('Provider update successful?');
        })
        .catch((error: Error) => {
          console.log('Update failure for sure', error.message);
        });
    }
  }

  async verifyEmail(idToken: string) {
    const token: any = await this.validateToken(idToken);

    if (token.valid) {
      const pool = new Pool(victorCredentials);
      pool.query(validateUserEmailQuery, [token.uid])
        .catch((error: Error) => { console.log('Validating User Error:', error.message); });
      pool.query(validateProviderEmailQuery, [token.uid])
        .catch ((error: Error) => { console.log('Validating Provider Error:', error.message); });
    }
  }
}
