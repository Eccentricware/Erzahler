"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCheckExistingAccountsQuery = void 0;
const generateCheckExistingAccountsQuery = (username, email) => {
    return `
    SELECT *
    FROM players;
  `;
};
exports.generateCheckExistingAccountsQuery = generateCheckExistingAccountsQuery;
