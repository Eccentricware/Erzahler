import { Pool } from 'pg';
import { checkEmailExistsInDBQuery } from '../../database/queries/accounts/check-email-exists-in-db-query';
import { checkUsernameInDBQuery } from '../../database/queries/accounts/check-username-in-db-query';
import { victorCredentials } from '../../secrets/dbCredentials';
import { getAuth, fetchSignInMethodsForEmail, createUserWithEmailAndPassword, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../secrets/firebase';

export class AccountService {
  async createAccountWithUsernameAndEmail(username: string, email: string, password: string): Promise<any> {
    const firebaseApp = initializeApp(firebaseConfig, 'Erzahler');
    const auth = getAuth(firebaseApp);

    this.checkEmailUsernameAvailability(username, email)
      .then((usernameEmailAvailableResult: any) => {
        if (usernameEmailAvailableResult) {
          const newUser: any = createUserWithEmailAndPassword(auth, email, password)
            .then((newUser: any) => {
              return newUser;
            })
            .catch((error: Error) => {
              return error.message;
            });
          return newUser;
        } else {
          return 'Username or email is unavailable';
        }
      });
  }

  async checkEmailUsernameAvailability(username: string, email: string): Promise<any> {
    return Promise.all([this.checkUsernameInDB(username), this.checkEmailAvailability(email)])
      .then((availabilityResult: any) => {
        if (availabilityResult[0] && availabilityResult[1]) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error: Error) => { return error.message });
  }

  async checkEmailAvailability(email: string): Promise<any> {
    return Promise.all([this.checkEmailInDB(email), this.checkEmailInFB(email)])
      .then((emailsUsed: any) => {
        let emailAvailable: boolean = true;

        if (emailsUsed[0] === true) {
          console.log("Email already in Database")
          emailAvailable = false;
        }

        if  (emailsUsed[1] === true)  {
          console.log("Email already in Firebase");
          emailAvailable = false;
        }

        return emailAvailable;
      });
  }

  async checkEmailInDB(email: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(checkEmailExistsInDBQuery, [email])
      .then((emailCountResponse: any) => {
        const { email_exists } = emailCountResponse.rows[0];
        console.log(emailCountResponse.rows[0])
        if (( email_exists ) === '1') {
          return true;
        } else {
          return false;
        }
      })
      .catch((e: Error) => console.error(e.stack));
  }

  async checkEmailInFB(email: string): Promise<any> {
    const firebaseApp = initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);

    return fetchSignInMethodsForEmail(auth, email)
      .then((signInMethods: any) => {
        if (signInMethods.length > 0) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error: Error) => {
        console.log(error);
      });
  }

  async checkUsernameInDB(username: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(checkUsernameInDBQuery, [username])
    .then((usernameCountResponse: any) => {
      const { username_exists } = usernameCountResponse.rows[0];
      console.log(username_exists.rows);
      if ( username_exists === '1') {
        return true;
      } else {
        return false;
      }
    })
    .catch((e: Error) => console.error(e.stack));
  }
}
