"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegisteredPlayersQuery = void 0;
exports.getRegisteredPlayersQuery = `
  SELECT u.user_id,
    u.username,
    a.assignment_type,
    a.assignment_status
  FROM users u
  INNER JOIN assignments a ON a.user_id = u.user_id
  INNER JOIN games g ON g.game_id = a.game_id
  WHERE g.game_id = $1
  ORDER BY u.username;
`;
//# sourceMappingURL=get-registered-players-query.js.map