import { checkExistingAccountsQuery } from "../../database/queries/accounts/accounts"
import { victorCredentials } from '../../secrets/dbCredentials';

const { Pool } = require('pg');

export const createAccountWithUsernameAndEmail = (
  username: string,
  email: string,
  password: string
): Promise<any> => {
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