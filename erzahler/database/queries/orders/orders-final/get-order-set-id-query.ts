export const getOrderSetIdQuery = `
  SELECT
    os.order_set_id
  FROM order_sets os
  INNER JOIN countries pc ON pc.country_id = os.country_id
  WHERE os.turn_id = $1
    AND os.order_set_type = 'Orders'
    AND pc.country_id = $2;
`;