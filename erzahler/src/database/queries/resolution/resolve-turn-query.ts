export const resolveTurnQuery = `
  UPDATE turns
  SET turn_status = 'Resolved',
    resolved_time = NOW()
  WHERE turn_id = $1;
`;