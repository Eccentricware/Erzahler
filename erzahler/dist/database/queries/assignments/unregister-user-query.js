"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unregisterUserQuery = void 0;
exports.unregisterUserQuery = `
  UPDATE assignments
  SET country_id = NULL,
    assignment_end = NOW() AT TIME ZONE 'utc',
    assignment_status = 'Unregistered'
  WHERE game_id = $1
    AND user_id = $2
    AND assignment_type = $3;
`;
//# sourceMappingURL=unregister-user-query.js.map