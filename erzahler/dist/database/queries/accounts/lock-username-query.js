"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lockUsernameQuery = void 0;
exports.lockUsernameQuery = `
  UPDATE users
  SET username_locked = true,
    user_status = 'Active'
  FROM providers
  WHERE users.user_id = providers.user_id
    AND providers.uid = $1;
`;
//# sourceMappingURL=lock-username-query.js.map