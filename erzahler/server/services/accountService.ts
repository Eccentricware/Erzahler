import { Pool } from 'pg';
import { checkExistingAccountsQuery } from '../../database/queries/accounts/check-existing-accounts-query';
import { victorCredentials } from '../../secrets/dbCredentials';

export class AccountService {
  createAccountWithUsernameAndEmail = (
    username: string,
    email: string,
    password: string
  ): any => {
    const existingAccountResults = this.checkExistingAccountsInDB(username, email);
    existingAccountResults.then((existingAccounts) => {
      return existingAccounts;
    });
    return existingAccountResults;
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
}