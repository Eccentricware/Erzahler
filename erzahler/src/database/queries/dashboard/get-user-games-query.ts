export const getUserGamesQuery = `
  WITH last_turns AS (
    SELECT t.game_id,
      MAX(turn_id) as turn_id
    FROM turns t
    WHERE turn_status != 'Preliminary'
    GROUP BY t.game_id
    ORDER BY t.game_id
  )
  SELECT g.game_id,
    g.game_name,
    g.game_status,
    t.turn_name,
    t.turn_status,
    CASE WHEN G.game_status IN ('Playing', 'Finished')
      THEN c.country_name
      ELSE 'Registered'
    END AS country_name,
    CASE WHEN G.game_status IN ('Playing', 'Finished')
      THEN lch.country_status
      ELSE 'Registered'
    END AS country_status,
    t.deadline AT TIME ZONE us.time_zone
  FROM games g
  INNER JOIN last_turns lt ON lt.game_id = g.game_id
  INNER JOIN turns t ON t.turn_id = lt.turn_id AND t.game_id = lt.game_id
  INNER JOIN assignments a ON a.game_id = g.game_id
  INNER JOIN user_settings us ON us.user_id = a.user_id
  LEFT JOIN countries c ON c.country_id = a.country_id
  LEFT JOIN get_last_country_history(g.game_id, 10000) lch ON lch.country_id = a.country_id
  WHERE a.user_id = $1
    AND g.game_status IN ('Registration', 'Ready', 'Playing')
  ORDER BY t.deadline;
`;
