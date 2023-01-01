export const getPlayerCountryQuery = `
  SELECT country_id
  FROM assignments a
  WHERE game_id = $1
    AND user_id = $2
    AND assignment_type = 'Player'
    AND assignment_end IS NULL;
`;