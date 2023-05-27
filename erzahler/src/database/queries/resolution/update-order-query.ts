export const updateOrderQuery = `
  UPDATE orders
  SET order_status = $1,
    order_success = $2,
    power = $3,
    valid = $4,
    description = $5,
    primary_resolution = $6,
    secondary_resolution = $7
  WHERE order_id = $8
`;