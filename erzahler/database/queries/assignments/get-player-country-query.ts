export const getPlayerCountryQuery = `
  SELECT a.country_id,
    c.country_name
  FROM assignments a
  INNER JOIN countries c ON c.country_id = a.country_id
  WHERE a.game_id = $1
    AND user_id = $2
    AND assignment_type = 'Player'
    AND assignment_end IS NULL;
`;