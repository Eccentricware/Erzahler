"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserQuery = void 0;
exports.registerUserQuery = `
  INSERT INTO assignments (
    game_id,
    user_id,
    assignment_type,
    assignment_status,
    assignment_start
  ) VALUES (
    $1,
    $2,
    $3,
    'Registered',
    NOW() AT TIME ZONE 'utc'
  );
`;
//# sourceMappingURL=register-user-query.js.map