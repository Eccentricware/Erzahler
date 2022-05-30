import { Pool } from 'pg';
import { getUserEmailQuery } from '../../database/queries/accounts/get-user-email-query';
import { getUsernameQuery } from '../../database/queries/accounts/get-username-query';
import { victorCredentials } from '../../secrets/dbCredentials';
import { CredentialCheck } from '../../models/credential-check';
import { getAuth, UserInfo, UserRecord } from 'firebase-admin/auth'
import { createUserQuery } from '../../database/queries/accounts/create-user-query';
import { createProviderQuery } from '../../database/queries/accounts/create-provider-query';
import { error } from 'console';

export class AccountService {
  async addUserWithEmail(idToken: string, username: string, email?: string): Promise<any> {
    const token = await this.verifyFirebaseUser(idToken);

    if (token.valid) {
      const firebaseUser = await this.getFirebaseUser(token.uid);
      this.addUserToDatabase(firebaseUser, username);
      return firebaseUser;
    }
  }

  async checkUsernameInDB(username: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(getUsernameQuery, [username])
      .then((usernameCountResponse: any) => {
        if (usernameCountResponse.rows.length === 0) {
          return true;
        } else {
          return false;
        }
      })
      .catch((e: Error) => console.error(e.message));
  }

  async checkEmailUsernameAvailability(username: string, email: string): Promise<any> {
    return Promise.all([this.checkUsernameInDB(username), this.checkEmailAvailability(email)])
      .then((availabilityResult: any) => {
        const credentialCheck: CredentialCheck = {
          usernameAvailable: true,
          emailAvailable: true,
          credentialsAvailable: true
        };

        if (availabilityResult[0] === false) {
          credentialCheck.usernameAvailable = false;
          credentialCheck.credentialsAvailable = false;
        }

        if (availabilityResult[1] === false) {
          credentialCheck.emailAvailable = false;
          credentialCheck.credentialsAvailable = false;
        }

        if (credentialCheck.credentialsAvailable) {
          return credentialCheck;
        } else {
          return credentialCheck;
        }

      })
      .catch((error: Error) => { return error.message });
  }

  async checkEmailAvailability(email: string): Promise<any> {
    return Promise.all([this.checkEmailInDB(email), this.checkEmailInFB(email)])
      .then((emailsUsed: any) => {
        let emailAvailable: boolean = true;

        if (emailsUsed[0] === false) {
          emailAvailable = false;
        }

        if  (emailsUsed[1] === false)  {
          emailAvailable = false;
        }

        return emailAvailable;
      });
  }

  async addUserToDatabase(
    firebaseUser: UserRecord,
    username: string,
  ): Promise<any> {
    const pool = new Pool(victorCredentials);
    const usernameInDB = await this.checkUsernameInDB(username);

    let verificationDeadline: string | null = null;

    if (!usernameInDB) {
      if (firebaseUser.providerData[0].providerId === 'password') {
        await getAuth()
          .updateUser(firebaseUser.uid, {
            displayName: username
          })
          .then((user: UserRecord) => {
            return 'Hopefully that updates in time';
          })
          .catch((error: Error) => {
            return error.message;
          });

        let creationTime: Date = new Date(firebaseUser.metadata.creationTime);
        creationTime = new Date(creationTime.getTime() * 86400000)
        verificationDeadline = creationTime.toISOString();
      }

      pool.query(
      createUserQuery, [
        username,
        firebaseUser.email,
        firebaseUser.emailVerified,
        verificationDeadline,
        firebaseUser.metadata.creationTime,
        firebaseUser.metadata.lastSignInTime
      ]).then(() => {

        return this.getUserId(username).then((userId) => {
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
            return error.message;
          });
        })
      }).catch((error: Error) => {
        return error.message;
      });
    }
  }

  async checkEmailInDB(email: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(getUserEmailQuery, [email])
      .then((emailResponse: any) => {
        if (emailResponse.rows.length === 0) {
          return true;
        } else {
          return false;
        }

      })
      .catch((e: Error) => console.error(e.message));
  }

  async checkEmailInFB(email: string): Promise<any> {
    // const firebaseApp = initializeApp(firebaseConfig);
    // const auth = getAuth(firebaseApp);

    // return fetchSignInMethodsForEmail(auth, email)
    //   .then((signInMethods: any) => {
    //     console.log('Sign in methods:', signInMethods);
    //     if (signInMethods.length === 0) {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   })
    //   .catch((error: Error) => {
    //     return error.message;
    //   });
  }

  async getUserId(username: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(getUsernameQuery, [username])
      .then((userResult: any) => {
        return userResult.rows[0].user_id;
      })
      .catch((e: Error) => console.error(e.message));
  }



  // async addUserToDatabase(pool: Pool, newUser: User, username: string): Promise<any> {
  //   return pool.query(
  //     createUserQuery,
  //     [
  //       username,
  //       newUser.uid,
  //       newUser.email,
  //       newUser.emailVerified,
  //       newUser.metadata.creationTime
  //     ]
  //   ).then(() => {
  //     return this.getUserId(username).then((userId) => {
  //       return pool.query(
  //         createProviderQuery,
  //         [
  //           userId,
  //           newUser.providerData[0].providerId,
  //           newUser.providerData[0].uid,
  //           newUser.providerData[0].displayName,
  //           newUser.providerData[0].email,
  //           newUser.providerData[0].phoneNumber,
  //           newUser.providerData[0].photoURL
  //         ]
  //       ).then(() => {
  //         return true;
  //       }).catch((error: Error) => {
  //         return error.message;
  //       });
  //     })

  //   }).catch((error: Error) => {
  //     return error.message;
  //   });
  // }

  // async validateUser(idToken: string): Promise<boolean> {
  //   getAuth().verifyIdToken(idToken, true)
  // }

  // async signInWithGoogle() {
  //   const auth = getAuth();
  //   const provider = new GoogleAuthProvider();
  //   return signInWithPopup(auth, provider)
  //     .then((result) => {
  //       // This gives you a Google Access Token. You can use it to access the Google API.
  //       const credential = GoogleAuthProvider.credentialFromResult(result);
  //       if (credential) {
  //         const token = credential.accessToken;
  //       }
  //       // The signed-in user info.
  //       const user = result.user;
  //       return user;
  //       // ...
  //     }).catch((error) => {
  //       // Handle Errors here.
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //       // The email of the user's account used.
  //       const email = error.customData.email;
  //       // The AuthCredential type that was used.
  //       const credential = GoogleAuthProvider.credentialFromError(error);
  //       return {
  //         error: error.message
  //       };
  //       // ...
  //     });
  // }

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
