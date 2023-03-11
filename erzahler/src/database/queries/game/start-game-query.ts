export const startGameQuery = `
  UPDATE games
  SET game_status = $1,
    ready_time = NOW() AT TIME ZONE 'utc',
    ready_to_start = true,
    start_time = $2
  WHERE game_id = $3;
`;
