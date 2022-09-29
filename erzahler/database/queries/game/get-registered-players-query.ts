export const getRegisteredPlayersQuery = `
  SELECT u.user_id,
    u.username,
    a.assignment_type
  FROM users u
  INNER JOIN assignments a ON a.user_id = u.user_id
  INNER JOIN games g ON g.game_id = a.game_id
  WHERE g.game_id = $1
`;