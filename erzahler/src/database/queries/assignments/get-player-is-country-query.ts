export const getPlayerIsCountryQuery = `
  SELECT CASE WHEN COUNT(*) = 1 THEN true ELSE false END assigned
  FROM assignments
  WHERE game_id = $1
    AND user_id = $2
    AND country_id = $3
    AND assignment_type = 'Player'
    AND assignment_end IS NULL;
`;
