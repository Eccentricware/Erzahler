export const updateOrderSetsQuery = `
  UPDATE order_sets
  SET build_transfer_success = $1,
    tech_transfer_success = $2,
    increase_range_success = $3,
    nomination_success = $4,
    vote_success = $5
  WHERE turn_id = $6
    AND order_set_type = 'Orders';
`;
