export const startGameQuery = `
  UPDATE games
  SET game_status $1,
    time_ready = NOW() AT TIME ZONE 'utc',
    time_start = $2
  WHERE game_id = $3;
`;