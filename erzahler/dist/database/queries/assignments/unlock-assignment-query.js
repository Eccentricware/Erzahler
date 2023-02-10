"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlockAssignmentQuery = void 0;
exports.unlockAssignmentQuery = `
  UPDATE assignments
  SET assignment_status = 'Assigned'
  WHERE game_id = $1
    AND user_id = $2
    AND assignment_type = 'Player';
`;
//# sourceMappingURL=unlock-assignment-query.js.map