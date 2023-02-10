"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerRegistrationStatusQuery = void 0;
exports.getPlayerRegistrationStatusQuery = `
  SELECT a.assignment_type,
    a.assignment_end
  FROM assignments a
  INNER JOIN games g ON g.game_id = a.game_id
  WHERE g.game_id = $1
    AND a.user_id = $2;
`;
//# sourceMappingURL=get-player-registration-status.js.map