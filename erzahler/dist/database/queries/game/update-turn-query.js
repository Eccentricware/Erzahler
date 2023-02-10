"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTurnQuery = void 0;
exports.updateTurnQuery = `
  UPDATE turns
  SET deadline = $1,
    turn_status = $2
  WHERE turn_number = $3
    AND game_id = $4
  RETURNING
    turn_id,
    turn_name
    deadline;
`;
//# sourceMappingURL=update-turn-query.js.map