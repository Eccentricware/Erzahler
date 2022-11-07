export const getAssignmentsQuery = `
  SELECT
	c.country_id,
    c.country_name,
	CASE
      WHEN (
        SELECT 1
        FROM assignments a
        WHERE a.game_id = $1
          and a.assignment_type IN ('Administrator', 'Creator', 'Superuser')
          and a.user_id = $2
          and a.assignment_end IS NULL
      ) = 1
        OR g.game_status != 'Registration'
      THEN u.user_id
      ELSE NULL
    END user_id,
    CASE
      WHEN (
        SELECT 1
        FROM assignments a
        WHERE a.game_id = $1
          and a.assignment_type IN ('Administrator', 'Creator', 'Superuser')
          and a.user_id = $2
          and a.assignment_end IS NULL
      ) = 1
        OR g.game_status != 'Registration'
      THEN u.username
      ELSE NULL
    END username,
    CASE
      WHEN (
        SELECT 1
        FROM assignments a
        WHERE a.game_id = $1
          and a.assignment_type IN ('Administrator', 'Creator', 'Superuser')
          and a.user_id = $2
          and a.assignment_end IS NULL
      ) = 1
        OR g.game_status != 'Registration'
      THEN a.assignment_status
      ELSE NULL
    END assignment_status
  FROM countries c
  INNER JOIN games g ON g.game_id = c.game_id
  LEFT JOIN assignments a ON a.country_id = c.country_id
  LEFT JOIN users u ON u.user_id = a.user_id
  WHERE g.game_id = $1
    AND c.rank != 'n'
  ORDER BY c.rank, c.country_name;
`;