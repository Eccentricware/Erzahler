export const getAssignmentsQuery = `
  SELECT
    c.country_name,
    CASE
      WHEN (
        SELECT 1
        FROM assignments a
        WHERE a.game_id = $1
          and a.assignment_type IN ('administrator', 'creator', 'superuser')
          and a.user_id = $2
          and a.assignment_end IS NULL
      ) = 1
        OR g.game_status != 'registration'
      THEN u.username
      ELSE NULL
    END username
  FROM countries c
  INNER JOIN games g ON g.game_id = c.game_id
  LEFT JOIN assignments a ON a.country_id = c.country_id
  LEFT JOIN users u ON u.user_id = a.user_id
  WHERE g.game_id = $1
  ORDER BY c.rank, c.country_name;
`;