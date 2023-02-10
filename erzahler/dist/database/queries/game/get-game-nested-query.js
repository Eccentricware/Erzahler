"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameNestedQuery = void 0;
exports.getGameNestedQuery = `
  WITH game_assignments as (
  SELECT
  g.game_id,
  c.country_id,
    c.country_name,
    CASE
      WHEN (
        SELECT 1
        FROM Assignments a
        WHERE a.game_id = 42
          and a.assignment_type IN ('Administrator', 'Creator', 'Superuser')
          and a.user_id = 1
          and a.assignment_end IS NULL
      ) = 1
      THEN u.username
      ELSE NULL
    END username
  FROM countries c
  INNER JOIN games g ON g.game_id = c.game_id
  LEFT JOIN assignments a ON a.country_id = c.country_id
  LEFT JOIN users u ON u.user_id = a.user_id
  WHERE g.game_id = 42
  GROUP BY g.game_id,
  c.country_id,
  c.country_name,
  u.username,
  c.rank
  ORDER BY c.rank, c.country_name
), rules_in_game AS (
  SELECT
  rig.game_id,
  r.rule_name,
    r.rule_key,
    r.rule_description,
    rig.rule_enabled
  FROM rules r
  INNER JOIN rules_in_games rig
  ON r.rule_id = rig.rule_id
  WHERE game_id = 42
GROUP BY r.rule_id,
  rig.game_id,
  rig.rule_enabled
)
SELECT
  g.game_id,
  g.game_name,
    g.time_created,
    g.game_status,
    g.current_year,
    g.stylized_start_year,
    g.concurrent_games_limit,
    g.private_game,
    g.hidden_game,
    g.blind_administrators,
    g.assignment_method,
    g.deadline_type,
    g.observe_dst,
    g.turn_1_timing,
    g.start_time,
    g.orders_day,
    g.orders_time,
    g.retreats_day,
    g.retreats_time,
    g.adjustments_day,
    g.adjustments_time,
    g.nominations_day,
    g.nominations_time,
    g.votes_day,
    g.votes_time,
    g.nmr_tolerance_total,
    g.nmr_tolerance_orders,
    g.nmr_tolerance_retreats,
    g.nmr_tolerance_adjustments,
    g.vote_delay_enabled,
    g.vote_delay_lock,
    g.vote_delay_percent,
    g.vote_delay_count,
    g.vote_delay_display_percent,
    g.vote_delay_display_count,
    g.partial_roster_start,
    g.final_readiness_check,
  json_agg(game_assignments) as assignments,
  json_agg(rules_in_game) as rules
FROM games g
INNER JOIN game_assignments ON game_assignments.game_id = g.game_id
INNER JOIN rules_in_game ON rules_in_game.game_id = g.game_id
WHERE g.game_id = 42
GROUP BY g.game_id
-- 	)
-- select row_to_json(game)
-- FROM game;
`;
//# sourceMappingURL=get-game-nested-query.js.map