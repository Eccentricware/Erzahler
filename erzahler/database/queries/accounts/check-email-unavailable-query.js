"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmailUnavailableQuery = void 0;
exports.checkEmailUnavailableQuery = `
  SELECT COUNT(email) as email_unavailable
  FROM players
  WHERE email = $1;
`;
