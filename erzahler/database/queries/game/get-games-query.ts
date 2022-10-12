export const getGamesQuery = `
  SELECT g.game_id,
    g.game_name,
    u.username as creator,
    g.nomination_timing,
    g.nomination_year,
    g.time_created,
    g.game_status,
    g.deadline_type,
    g.orders_day,
    g.orders_time AT TIME ZONE 'America/Los_Angeles' orders_time,
    g.orders_span,
    g.retreats_day,
    g.retreats_time AT TIME ZONE $1 retreats_time,
    g.retreats_span,
    g.adjustments_day,
    g.adjustments_time AT TIME ZONE $1 adjustments_time,
    g.adjustments_span,
    g.nominations_day,
    g.nominations_time AT TIME ZONE $1 nominations_time,
    g.nominations_span,
    g.votes_day,
    g.votes_time AT TIME ZONE $1 votes_time,
    g.votes_span,
    (
      SELECT COUNT(*)
      FROM countries c
      INNER JOIN games g
      ON g.game_id = c.game_id
      WHERE c.rank != 'n'
      GROUP BY g.game_id
      LIMIT 1
    ) as country_count,
    (
      SELECT COUNT (*)
      FROM assignments a
      INNER JOIN games g
      ON g.game_id = a.game_id
      WHERE a.assignment_type IN ('registered', 'assigned')
      GROUP BY g.game_id
      LIMIT 1
    ) as player_count
  FROM games g
  INNER JOIN assignments a ON a.game_id = g.game_id
  INNER JOIN users u ON u.user_id = a.user_id
  WHERE a.assignment_type = 'creator'
  ORDER BY g.time_created;
`;