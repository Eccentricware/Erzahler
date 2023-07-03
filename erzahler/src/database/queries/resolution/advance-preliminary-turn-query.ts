export const advancePreliminaryTurnQuery = `
  UPDATE turns
  SET turn_status = 'Pending'
  WHERE turn_id = $1;
`;