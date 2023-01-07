export const getUserGameAssignmentsQuery = `
  SELECT u.username,
    a.assignment_type,
    c.country_id,
    c.country_name,
    ch.country_status,
    ch.nuke_range,
    g.blind_administrators
  FROM users u
  LEFT JOIN assignments a ON a.user_id = u.user_id
  LEFT JOIN countries c ON c.country_id = a.country_id
  LEFT JOIN country_histories ch ON ch.country_id = c.country_id
  INNER JOIN games g ON g.game_id = a.game_id
  WHERE a.game_id = $1
    AND u.user_id = $2
    AND a.assignment_end IS NULL
  ORDER BY ch.turn_id DESC;
`;