import { Pool } from 'pg';
import { getUserEmailQuery } from '../../database/queries/accounts/get-user-email-query';
import { getUsernameQuery } from '../../database/queries/accounts/get-username-query';
import { victorCredentials } from '../../secrets/dbCredentials';
import { getAuth, UserRecord } from 'firebase-admin/auth'
import { createUserQuery } from '../../database/queries/accounts/create-user-query';
import { createProviderQuery } from '../../database/queries/accounts/create-provider-query';

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

  async verifyFirebaseUser(idToken: string): Promise<any> {
    return getAuth()
      .verifyIdToken(idToken, true)
      .then((user: any) => {
        console.log(user.uid);
        return {
          uid: user.uid,
          valid: true
        };
      })
      .catch((error: Error) => {
        return false;
      });
  }

  async attemptAddUserToDatabase(idToken: string, username: string): Promise<any> {
    const token = await this.verifyFirebaseUser(idToken);
    const usernameAvailable = await this.checkUsernameAvailable(username);

    if (token.valid && usernameAvailable) {
      const firebaseUser = await this.getFirebaseUser(token.uid);
      this.addUserToDatabase(firebaseUser, username);
      return firebaseUser;
    }
  }

  async addUserToDatabase(
    firebaseUser: UserRecord,
    username: string,
  ): Promise<any> {
    if (firebaseUser.providerData[0].providerId === 'password') {
      await getAuth()
        .updateUser(firebaseUser.uid, {
          displayName: username
        })
        .then((user: UserRecord) => {
          console.log('Updated User', user);
        })
        .catch((error: Error) => {
          return error.message;
        });

      let verificationDeadline: number = Date.now();
      verificationDeadline += 86400000;

      const emailUserArgs = [
        username,
        false,
        new Date(verificationDeadline),
        firebaseUser.metadata.creationTime,
        firebaseUser.metadata.lastSignInTime,
        'unverified'
      ];

      return this.runAddUserQuery(firebaseUser, username, emailUserArgs);

    } else {
      const oAuthUserArgs = [
        username,
        true,
        // verificationDeadline,
        null,
        firebaseUser.metadata.creationTime,
        firebaseUser.metadata.lastSignInTime,
        'active'
      ];

      return this.runAddUserQuery(firebaseUser, username, oAuthUserArgs);
    }
  }

  async runAddUserQuery(firebaseUser: UserRecord, username: string, userArgs: any[]) {
    const pool = new Pool(victorCredentials);

    return pool.query(createUserQuery, userArgs).then((response: any) => {
      console.log('add user response', response);

      return this.getUserId(username)
        .then((userId) => {
          console.log('New user_id', userId);
          return pool.query(
            createProviderQuery,
            [
              userId,
              firebaseUser.uid,
              firebaseUser.providerData[0].providerId,
              firebaseUser.providerData[0].displayName,
              firebaseUser.providerData[0].email,
              firebaseUser.providerData[0].photoURL,
              firebaseUser.metadata.creationTime,
              firebaseUser.metadata.lastSignInTime
            ]
          ).then(() => {
            return true;
          }).catch((error: Error) => {
            console.log('add provider error', error.message);
            return error.message;
          });
        })
        .catch((error: Error) => {
          console.log('Get userId error:', error.message);
        })
    }).catch((error: Error) => {
      console.log('Add user db error:', error.message);
      return error.message;
    });
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
}
