"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnvironmentUserQuery = void 0;
exports.createEnvironmentUserQuery = `
  INSERT INTO users (
    username,
    username_locked,
    user_status,
    signup_time,
    last_sign_in_time,
    time_zone,
    ce_id
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7
  );
`;
//# sourceMappingURL=create-environment-user-query.js.map