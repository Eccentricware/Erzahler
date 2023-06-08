export const readyGameQuery = `
  UPDATE games
  SET game_status = 'Ready',
    ready_time = NOW() AT TIME ZONE 'utc',
    --ready_to_start = true,
    start_time = $1
  WHERE game_id = $2;
`;
