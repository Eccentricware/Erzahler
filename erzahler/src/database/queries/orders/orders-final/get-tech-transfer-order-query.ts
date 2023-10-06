export const getTechTransferOrderQuery = `
  SELECT
    ot.order_transfer_id,
    os.order_set_id,
    c.country_id,
    c.country_name,
    --ch.country_status,
    ot.foreign_country_id,
    ot.foreign_country_name,
    --CASE WHEN ch.nuke_range IS NOT NULL THEN true ELSE false END has_nukes
    ot.success
  FROM orders_transfers ot
  INNER JOIN order_sets os ON os.order_set_id = ot.order_set_id
  INNER JOIN countries c ON c.country_id = os.country_id
  WHERE os.turn_id = $1
    AND os.country_id = $2
    AND ot.order_type = 2;
`;
