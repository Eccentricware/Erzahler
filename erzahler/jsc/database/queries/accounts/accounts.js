"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkExistingAccountsQuery = void 0;
exports.checkExistingAccountsQuery = `
  SELECT *
  FROM players
  WHERE username = $1
  OR email = $2;
`;
