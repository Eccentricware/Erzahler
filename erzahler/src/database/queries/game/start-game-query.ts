export const startGameQuery = `
  UPDATE games
  SET game_status = 'Playing'
  WHERE game_id = $1;
`;
