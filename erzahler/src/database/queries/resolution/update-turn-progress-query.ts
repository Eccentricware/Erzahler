export const updateTurnProgressQuery = `
  UPDATE turns
  SET turn_status = $1,
    resolved_time = CASE WHEN CAST ($1 as VARCHAR(23)) = 'Resolved' THEN NOW() ELSE null END
  WHERE turn_id = $2
  RETURNING turn_id,
    game_id,
    turn_number,
    turn_name,
    turn_type,
    turn_status,
    year_number,
    deadline;
`;
