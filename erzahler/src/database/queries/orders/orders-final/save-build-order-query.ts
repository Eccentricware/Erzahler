export const saveBuildOrderQuery = `
  UPDATE build_orders
  SET build_type = $1,
    node_id = $2,
    destination_id = $3,
    order_status = $4
  WHERE order_set_id = $5
    AND build_number = $6;
`;
