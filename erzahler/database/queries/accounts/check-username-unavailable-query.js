"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUsernameUnavailableQuery = void 0;
exports.checkUsernameUnavailableQuery = `
  SELECT COUNT(username) as username_unavailable
  FROM players
  WHERE username = $1;
`;
