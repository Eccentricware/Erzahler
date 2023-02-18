export const saveVotesQuery = `
  UPDATE order_sets
  SET votes = $1
  WHERE order_set_id = $2;
`;