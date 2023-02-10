"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserGameAdminQuery = void 0;
exports.checkUserGameAdminQuery = `
  SELECT u.user_id
  FROM users u
  INNER JOIN providers p ON p.user_id = u.user_id
  INNER JOIN assignments a ON a.user_id = u.user_id
  WHERE p.uid = $1
    AND a.game_id = $2
    AND a.assignment_type IN ('Administrator', 'Commander', 'Creator')
`;
//# sourceMappingURL=check-user-game-admin-query.js.map