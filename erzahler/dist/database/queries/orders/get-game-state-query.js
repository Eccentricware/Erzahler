"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameStateQuery = void 0;
exports.getGameStateQuery = `
  SELECT g.game_id,
    t.turn_id,
    t.deadline,
    t.turn_number,
    t.turn_name,
    t.turn_type,
    t.turn_status,
    t.resolved_time,
    t.deadline_missed,
    pt1.turn_id pending_turn_id,
    pt1.turn_type pending_turn_type,
    pt2.turn_id preliminary_turn_id,
    pt2.turn_type preliminary_turn_type,
    g.nominate_during_adjustments,
    g.vote_during_spring,
    g.nomination_timing,
    g.nomination_year,
    g.current_year,
    t.year_number,
    c.highest_ranked_req,
    c.all_votes_controlled,
    CASE
      WHEN uh.unit_status = 'Retreat'
      THEN true ELSE false
    END AS units_in_retreat,
    default_nuke_range
  FROM games g
  INNER JOIN turns t ON t.game_id = g.game_id
  INNER JOIN coalition_schedules c ON c.game_id = g.game_id
  INNER JOIN unit_histories uh ON uh.turn_id = t.turn_id
  LEFT JOIN turns pt1 ON pt1.game_id = g.game_id AND pt1.turn_status = 'Pending'
  LEFT JOIN turns pt2 ON pt2.game_id = g.game_id AND pt2.turn_status = 'Preliminary'
  WHERE g.game_id = $1
    AND t.turn_status = 'Resolved'
  ORDER BY turn_id DESC,
    uh.unit_status DESC
  LIMIT 1;
`;
//# sourceMappingURL=get-game-state-query.js.map