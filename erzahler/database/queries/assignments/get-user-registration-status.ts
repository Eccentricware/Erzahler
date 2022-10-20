export const getUserRegistrationStatus = `
  SELECT a.assignment_type
  FROM assignments a
  INNER JOIN games g ON g.game_id = a.game_id
  WHERE g.game_id = $1
    AND a.user_id = $2
    AND a.assignment_end IS NULL;
`;