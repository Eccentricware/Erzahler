"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountUserQuery = void 0;
exports.createAccountUserQuery = `
  INSERT INTO users (
    username,
    username_locked,
    user_status,
    signup_time,
    last_sign_in_time,
    time_zone
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  ) RETURNING
  user_id;
`;
//# sourceMappingURL=create-account-user-query.js.map