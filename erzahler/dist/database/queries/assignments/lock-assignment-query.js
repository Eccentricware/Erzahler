"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lockAssignmentQuery = void 0;
exports.lockAssignmentQuery = `
  UPDATE assignments
  SET assignment_status = 'Locked'
  WHERE game_id = $1
    AND user_id = $2
    AND assignment_type = 'Player';
`;
//# sourceMappingURL=lock-assignment-query.js.map