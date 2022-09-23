export const getGameDetailsQuery = `
WITH assignments as (
	SELECT
	g.game_id,
    c.country_name,
    CASE
      WHEN (
        SELECT 1
        FROM Assignments a
        WHERE a.game_id = $1
          and a.assignment_type IN ('administrator', 'creator', 'superuser')
          and a.user_id = $2
          and a.assignment_end IS NULL
      ) = 1
      THEN u.username
      ELSE NULL
    END username
  FROM countries c
  INNER JOIN games g ON g.game_id = c.game_id
  LEFT JOIN assignments a ON a.country_id = c.country_id
  LEFT JOIN users u ON u.user_id = a.user_id
  WHERE g.game_id = $1
  ORDER BY c.rank, c.country_name
)
SELECT g.game_name,
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
    g.game_time_zone,
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
	json_agg(assignments) as assignments
FROM games g
LEFT JOIN assignments  ON assignments.game_id = g.game_id
WHERE g.game_id = $1
GROUP BY g.game_id
	)
select row_to_json(game)
FROM game
`;