import { Pool } from 'pg';
import { getUserEmailQuery } from '../../database/queries/accounts/get-user-email-query';
import { getUserUsernameQuery } from '../../database/queries/accounts/get-user-username-query';
import { victorCredentials, victorAuthCredentials } from '../../secrets/dbCredentials';
import { getAuth, fetchSignInMethodsForEmail, createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../secrets/firebase';
import { CredentialCheck } from '../../models/credential-check';
import { createUserQuery } from '../../database/queries/accounts/create-user-query';
import { createProviderQuery } from '../../database/queries/accounts/create-provider-query';

export class AccountService {
  async createAccountWithUsernameAndEmail(username: string, email: string, password: string): Promise<any> {
    const firebaseApp = initializeApp(firebaseConfig, 'Erzahler');
    const auth = getAuth(firebaseApp);

    return this.checkEmailUsernameAvailability(username, email)
      .then((checkResult: CredentialCheck): any => {

        if (checkResult.credentialsAvailable === true) {
          return createUserWithEmailAndPassword(auth, email, password)
            .then((newUser: UserCredential) => {
              const authPool = new Pool(victorAuthCredentials);
              const mainPool = new Pool(victorCredentials);

              return Promise.all([
                this.addUserToDatabase(authPool, newUser, username),
                this.addUserToDatabase(mainPool, newUser, username)
              ]).then((creationResult: any) => {
                console.log('Auth Creation Result:', creationResult[0]);
                console.log('Main Creation Result:', creationResult[1]);
                const creationDetails: any = {
                  auth: true,
                  main: true,
                  endResult: true
                };

                if (creationResult[0] === false) {
                  creationDetails.auth = false;
                  creationDetails.endResult = false;
                }

                if (creationResult[1] === false) {
                  creationDetails.main = false;
                  creationDetails.endResult = false;
                }

                return creationDetails;
              }).catch((error: Error) => {
                return error.message;
              });
            }).catch((error: Error) => {
              return error.message;
            });

        } else {
          return {
            success: false,
            credentialStatus: checkResult
          };
        }
      });
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
    const firebaseApp = initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);

    return fetchSignInMethodsForEmail(auth, email)
      .then((signInMethods: any) => {
        if (signInMethods.length === 0) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error: Error) => {
        console.log(error);
        return error.message;
      });
  }

  async checkUsernameInDB(username: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(getUserUsernameQuery, [username])
    .then((usernameCountResponse: any) => {
      if (usernameCountResponse.rows.length === 0) {
        return true;
      } else {
        return false;
      }
    })
    .catch((e: Error) => console.error(e.message));
  }

  async getUserId(username: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(getUserUsernameQuery, [username])
      .then((userResult: any) => {
        return userResult.rows[0].user_id;
      })
      .catch((e: Error) => console.error(e.message));
  }

  async addUserToDatabase(pool: Pool, newUser: UserCredential, username: string): Promise<any> {
    return pool.query(
      createUserQuery,
      [
        username,
        newUser.user.uid,
        newUser.user.email,
        newUser.user.emailVerified,
        newUser.user.metadata.creationTime
      ]
    ).then(() => {
      return this.getUserId(username).then((userId) => {
        return pool.query(
          createProviderQuery,
          [
            userId,
            newUser.user.providerData[0].providerId,
            newUser.user.providerData[0].uid,
            newUser.user.providerData[0].displayName,
            newUser.user.providerData[0].email,
            newUser.user.providerData[0].phoneNumber,
            newUser.user.providerData[0].photoURL
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
