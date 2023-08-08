export const getUpcomingTurnsQuery = `
  SELECT g.game_id,
    t.turn_id,
    g.game_name,
    t.turn_name,
    t.turn_number,
    t.turn_type,
    t.turn_status,
    t.year_number,
    g.stylized_start_year + t.year_number AS year_stylized,
    t.deadline,
    t.defaults_ready
  FROM games g
  INNER JOIN turns t ON t.game_id = g.game_id
  WHERE t.turn_status IN ('Pending', 'Preliminary')
    AND CASE
      WHEN $1 != 0 THEN g.game_id = $1
      ELSE true
    END
  ORDER BY t.turn_type;
`;
