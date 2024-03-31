export const updateAdjOrderQuery = `
  UPDATE orders_adjustments
  SET success = $1
  WHERE build_order_id = $2;
`;
