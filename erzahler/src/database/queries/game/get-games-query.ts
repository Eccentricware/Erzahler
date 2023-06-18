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
  ),
  games_user_playing AS (
    SELECT a.game_id,
      a.user_id
    FROM assignments a
    WHERE
      CASE
        WHEN $1 > 0 AND $3 = true
          THEN a.assignment_type = 'Player' AND a.user_id = $1
        ELSE true
      END
  ),
  games_user_created AS (
    SELECT a.game_id,
      a.user_id
    FROM assignments a
    WHERE
      CASE
        WHEN $1 > 0 AND $4 = true
          THEN a.assignment_type = 'Creator' AND a.user_id = $1
        ELSE true
      END
  ),
  games_user_administrating AS (
    SELECT a.game_id,
      a.user_id
    FROM assignments a
    WHERE
      CASE
        WHEN $1 > 0 AND $5 = true
          THEN a.assignment_type = 'Administrator' AND a.user_id = $1
        ELSE true
      END
  )
  SELECT g.game_id,
    g.game_name,
    cu.username as creator,
    cig.country_count,
    pig.player_count,
    g.nomination_timing,
    g.nomination_year,
    g.time_created,
    g.game_status,
    g.deadline_type,
    g.orders_day,
    g.orders_time AT TIME ZONE $2 orders_time,
    g.orders_span,
    g.retreats_day,
    g.retreats_time AT TIME ZONE $2 retreats_time,
    g.retreats_span,
    g.adjustments_day,
    g.adjustments_time AT TIME ZONE $2 adjustments_time,
    g.adjustments_span,
    g.nominations_day,
    g.nominations_time AT TIME ZONE $2 nominations_time,
    g.nominations_span,
    g.votes_day,
    g.votes_time AT TIME ZONE $2 votes_time,
    g.votes_span
  FROM games g
  LEFT JOIN players_in_games pig ON pig.game_id = g.game_id
  LEFT JOIN countries_in_games cig ON cig.game_id = g.game_id
  INNER JOIN games_user_playing gup ON gup.game_id = g.game_id
  INNER JOIN games_user_created guc ON guc.game_id = g.game_id
  INNER JOIN games_user_administrating gua ON gua.game_id = g.game_id
  LEFT JOIN assignments ca ON ca.game_id = g.game_id AND ca.assignment_type = 'Creator'
  LEFT JOIN users cu ON cu.user_id = ca.user_id
  GROUP BY g.game_id,
    cu.username,
    cig.country_count,
    pig.player_count,
    g.nomination_timing,
    g.nomination_year,
    g.time_created,
    g.game_status,
    g.deadline_type,
    g.orders_day,
    g.orders_time,
    g.orders_span,
    g.retreats_day,
    g.retreats_time,
    g.retreats_span,
    g.adjustments_day,
    g.adjustments_time,
    g.adjustments_span,
    g.nominations_day,
    g.nominations_time,
    g.nominations_span,
    g.votes_day,
    g.votes_time,
    g.votes_span
  ORDER BY g.time_created;
`;
