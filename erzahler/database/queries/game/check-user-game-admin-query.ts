export const checkUserGameAdminQuery = `
  SELECT u.user_id
  FROM users u
  INNER JOIN providers p ON p.user_id = u.user_id
  INNER JOIN assignments a ON a.user_id = u.user_id
  WHERE p.uid = $1
    AND a.game_id = $2
    AND a.assignment_type IN ('administrator', 'commander', 'creator')
`;