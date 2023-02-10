"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGameNameAvailabilityQuery = void 0;
exports.checkGameNameAvailabilityQuery = `
  SELECT game_name
  FROM games
  WHERE LOWER(game_name) = LOWER($1);
`;
//# sourceMappingURL=check-game-name-availability-query.js.map