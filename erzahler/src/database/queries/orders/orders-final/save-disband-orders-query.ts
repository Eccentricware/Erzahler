export const saveDisbandOrdersQuery = `
  UPDATE order_sets
  SET units_disbanding = $1,
    increase_range = $2
  WHERE order_set_id = $3;
`;
