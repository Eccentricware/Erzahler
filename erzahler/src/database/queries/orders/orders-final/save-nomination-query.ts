export const saveNominationQuery = `
  UPDATE order_sets
  SET nomination = $1
  WHERE order_set_id = $2;
`;
