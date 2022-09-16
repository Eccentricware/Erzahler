export const checkUserGameAdminQuery = `
  SELECT user_id
  FROM assignments
  WHERE game_id = $1
  AND user_id = $2,
  AND assignment_type IN ('administrator', 'commander', 'creator'),
  AND assignment_end IS NULL;
`;