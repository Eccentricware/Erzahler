export const getGamesQuery = `
  WITH countries_in_games AS (
      SELECT c.game_id,
        COUNT(c.game_id) as country_count
      FROM countries c
      WHERE c.rank != 'n'
      GROUP BY c.game_id
      ORDER BY c.game_id
    ),
    players_in_games AS (
      SELECT a.game_id,
        COUNT(a.game_id) as player_count
      FROM assignments a
      INNER JOIN games g ON g.game_id = a.game_id
      WHERE a.assignment_type = 'Player'
      AND
        CASE
          WHEN g.game_status = 'Registration' THEN a.assignment_status IN ('Assigned', 'Locked', 'Registered') ELSE a.assignment_status = 'Active'
        END
      GROUP BY a.game_id
      ORDER BY a.game_id
    )
  SELECT g.game_id,
    g.game_name,
    u.username as creator,
    cig.country_count,
    pig.player_count,
    g.nomination_timing,
    g.nomination_year,
    g.time_created,
    g.game_status,
    g.deadline_type,
    g.orders_day,
    g.orders_time AT TIME ZONE $1 orders_time,
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
    g.votes_span
  FROM games g
  INNER JOIN assignments a ON a.game_id = g.game_id
  INNER JOIN users u ON u.user_id = a.user_id
  LEFT JOIN players_in_games pig ON pig.game_id = g.game_id
  LEFT JOIN countries_in_games cig ON cig.game_id = g.game_id
  WHERE a.assignment_type = 'Creator'
  ORDER BY g.time_created;
`;
