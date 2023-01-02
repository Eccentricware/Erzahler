export const setTurnDefaultsPreparedQuery = `
  UPDATE turns
  SET defaults_ready = true
  WHERE turn_id = $1;
`;