export const readyGameQuery = `
  UPDATE games
  SET game_status = 'Ready',
    ready_time = NOW() AT TIME ZONE 'utc',
    start_time = $1
  WHERE game_id = $2;
`;
