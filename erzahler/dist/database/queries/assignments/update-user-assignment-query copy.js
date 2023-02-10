"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reregisterUserQuery = void 0;
exports.reregisterUserQuery = `
  UPDATE assignments
  SET country_id = $1,
    assignment_start = $2,
    assignment_end = $3,
    assignment_status = $4
  WHERE user_id = $5
    AND game_id = $6
    AND assignment_type = $7;
`;
//# sourceMappingURL=update-user-assignment-query%20copy.js.map