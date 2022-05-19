import { Pool } from 'pg';
import { checkExistingAccountsQuery } from '../../database/queries/accounts/check-existing-accounts-query';
import { checkEmailUnavailableQuery } from '../../database/queries/accounts/check-email-unavailable-query';
import { checkUsernameUnavailableQuery } from '../../database/queries/accounts/check-username-unavailable-query';
import { victorCredentials } from '../../secrets/dbCredentials';
import { getAuth, fetchSignInMethodsForEmail, createUserWithEmailAndPassword, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../secrets/firebase';

export class AccountService {
  createAccountWithUsernameAndEmail (
    username: string,
    email: string,
    password: string
  ): any {
    const firebaseApp = initializeApp(firebaseConfig, 'Erzahler');
    const auth = getAuth(firebaseApp);

    const newUser: any = createUserWithEmailAndPassword(auth, email, password)
      .then((newUser: any) => {
        return newUser;
      })
      .catch((error: Error) => {
        return error.message;
      });

    return newUser;

    // const existingAccountResults = this.checkExistingAccountsInDB(username, email);
    // existingAccountResults.then((existingAccounts) => {
    //   return existingAccounts;
    // });
    // return existingAccountResults;
  }

  checkExistingAccountsInDB = (username: string, email: string) => {
    const pool = new Pool(victorCredentials);

    const accounts = pool.query(
      checkExistingAccountsQuery,
      [username, email]
    )
    .then((accountResults: any) => {
      return accountResults.rows;
    })
    .catch((e: Error) => console.error(e.stack));

    return accounts;
  }

  checkEmailAvailability(email: string) {
    const pool = new Pool(victorCredentials);
    const firebaseApp = initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);

    const emailAvailableInDB = pool.query(
      checkEmailUnavailableQuery,
      [email]
    )
    .then((emailCountResponse: any) => {
      const { email_unavailable } = emailCountResponse.rows[0];
      if ((email_unavailable) === '1') {
        return false;
      } else {
        return true;
      }
    })
    .catch((e: Error) => console.error(e.stack));

    const emailAvailableInFirebase = fetchSignInMethodsForEmail(auth, email)
      .then((signInMethods: any) => {
        if (signInMethods.length > 0) {
          return false;
        } else {
          return true;
        }
      })
      .catch((error: Error) => {
        console.log(error);
      });

    return Promise.all([emailAvailableInDB, emailAvailableInFirebase])
    .then((results: any) => {
      if (results[0] === true && results[1] === true)  {
        return true;
      } else {
        return false;
      }
    })

    // return emailAvailableInDB;
  }

  checkUsernameAvailability(username: string) {
    const pool = new Pool(victorCredentials);

    const usernameAvailable = pool.query(
      checkUsernameUnavailableQuery,
      [username]
    )
      .then((usernameCountResponse: any) => {
        const { username_unavailable } = usernameCountResponse.rows[0];
        if ((username_unavailable) === '1') {
          return false;
        } else {
          return true;
        }
      })
      .catch((e: Error) => console.error(e.stack));

    return usernameAvailable;
  }
}
