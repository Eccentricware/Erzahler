export const getCountryOrderSetIdsQuery = `
  WITH pending AS (
    SELECT os.country_id,
      os.order_set_id
    FROM order_sets os
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE os.country_id = $1
      AND t.turn_status = 'Pending'
  ), preliminary AS (
  SELECT os.country_id,
    os.order_set_id
  FROM order_sets os
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE os.country_id = $1
    AND t.turn_status = 'Preliminary'
  )
  SELECT c.country_id,
    pending.order_set_id AS pending_order_set_id,
    preliminary.order_set_id AS preliminary_order_set_id
  FROM countries c
  LEFT JOIN pending ON pending.country_id = c.country_id
  LEFT JOIN preliminary ON preliminary.country_id = c.country_id
  WHERE c.country_id = $1;
`;