export const updateTurnQuery = `
  UPDATE turns
  SET deadline = $1
  WHERE turn_number = $2
    AND game_id = $3
`;