export const getGameAdminsQuery = `
  SELECT a.user_id,
    u.username,
    a.assignment_type
  FROM assignments a
  INNER JOIN users u ON u.user_id = a.user_id
  INNER JOIN games g ON g.game_id = a.game_id
  WHERE g.game_id = $1
    AND a.assignment_type IN ('Creator', 'Administrator')
    AND a.assignment_end IS NULL
  ORDER BY a.assignment_type DESC;
`;