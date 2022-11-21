export const updateTurnQuery = `
  UPDATE turns
  SET deadline = $1,
    turn_status = $2
  WHERE turn_number = $3
    AND game_id = $4
  RETURNING
    turn_id,
    turn_name
    deadline;
`;