"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAssignmentsActiveQuery = void 0;
exports.setAssignmentsActiveQuery = `
  UPDATE assignments
  SET assignment_status = 'Active'
  WHERE game_id = $1
    AND assignment_type = 'Player'
    AND assignment_status IN ('Assigned', 'Locked');
`;
//# sourceMappingURL=set-assignments-active-query.js.map