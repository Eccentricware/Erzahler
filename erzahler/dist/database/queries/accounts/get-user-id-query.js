"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdQuery = void 0;
exports.getUserIdQuery = `
  SELECT user_id
  FROM users
  WHERE lower(username) = LOWER($1);
`;
//# sourceMappingURL=get-user-id-query.js.map