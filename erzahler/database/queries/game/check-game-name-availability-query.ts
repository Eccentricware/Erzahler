export const checkGameNameAvailabilityQuery = `
  SELECT game_name
  FROM games
  WHERE LOWER(game_name) = LOWER($1);
`;