"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const pg_1 = require("pg");
const check_existing_accounts_query_1 = require("../../database/queries/accounts/check-existing-accounts-query");
const check_email_unavailable_query_1 = require("../../database/queries/accounts/check-email-unavailable-query");
const dbCredentials_1 = require("../../secrets/dbCredentials");
class AccountService {
    constructor() {
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
    createAccountWithUsernameAndEmail(username, email, password) {
        const existingAccountResults = this.checkExistingAccountsInDB(username, email);
        existingAccountResults.then((existingAccounts) => {
            return existingAccounts;
        });
        return existingAccountResults;
    }
    checkEmailAvailability(email) {
        const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
        const emailAvailable = pool.query(check_email_unavailable_query_1.checkEmailUnavailableQuery, [email])
            .then((emailCountResponse) => {
            const { email_unavailable } = emailCountResponse.rows[0];
            if ((email_unavailable) === '1') {
                return false;
            }
            else {
                return true;
            }
        })
            .catch((e) => console.error(e.stack));
        return emailAvailable;
    }
}
exports.AccountService = AccountService;
