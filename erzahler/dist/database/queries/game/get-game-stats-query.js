"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameStatsQuery = void 0;
exports.getGameStatsQuery = `
  SELECT c.country_id,
    c.country_name,
    c.rank,
    ch.city_count,
    ch.vote_count,
    ch.nuke_range,
    ch.adjustments
  FROM games g
  INNER JOIN countries c ON c.game_id = g.game_id
  INNER JOIN country_histories ch ON ch.country_id = c.country_id
  WHERE ch.country_status IN ('Active', 'Civil Disorder')
    AND g.game_id = $1
    AND ch.turn_id = $2
  ORDER BY c.rank,
    c.country_name;
`;
//# sourceMappingURL=get-game-stats-query.js.map