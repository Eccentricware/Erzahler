"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const pg_1 = require("pg");
const check_existing_accounts_query_1 = require("../../database/queries/accounts/check-existing-accounts-query");
const dbCredentials_1 = require("../../secrets/dbCredentials");
class AccountService {
    constructor() {
        this.createAccountWithUsernameAndEmail = (username, email, password) => {
            const existingAccountResults = this.checkExistingAccountsInDB(username, email);
            existingAccountResults.then((existingAccounts) => {
                return existingAccounts;
            });
            return existingAccountResults;
        };
        this.checkExistingAccountsInDB = (username, email) => {
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            const accounts = pool.query(check_existing_accounts_query_1.checkExistingAccountsQuery, [username, email])
                .then((accountResults) => {
                return accountResults.rows;
            })
                .catch((e) => console.error(e.stack));
            return accounts;
        };
    }
}
exports.AccountService = AccountService;
