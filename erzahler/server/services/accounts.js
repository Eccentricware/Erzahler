"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountWithUsernameAndEmail = void 0;
const accounts_1 = require("../../database/queries/accounts/accounts");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const { Pool } = require('pg');
const createAccountWithUsernameAndEmail = (username, email, password) => {
    const pool = new Pool(dbCredentials_1.victorCredentials);
    const accounts = pool.query(accounts_1.checkExistingAccountsQuery, [username, email])
        .then((accountResults) => {
        return accountResults.rows;
    })
        .catch((e) => console.error(e.stack));
    return accounts;
};
exports.createAccountWithUsernameAndEmail = createAccountWithUsernameAndEmail;
