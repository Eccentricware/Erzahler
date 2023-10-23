export const getTechTransferOrderQuery = `
  SELECT
    tt.tech_transfer_order_id,
    tt.order_set_id,
    c.country_id,
    c.country_name,
    CASE
      WHEN ch.nuke_range IS NULL THEN false
      ELSE true
    END as has_nukes,
    tt.foreign_country_id,
    tt.foreign_country_name,
    tt.description,
    tt.resolution,
    tt.success
  FROM orders_transfer_tech tt
  INNER JOIN order_sets os ON os.order_set_id = tt.order_set_id
  INNER JOIN countries c ON c.country_id = os.country_id
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = c.country_id
  INNER JOIN country_histories ch ON ch.country_id = lch.country_id
  WHERE os.turn_id = $3
    AND CASE
      WHEN $4 = 0 THEN true
      ELSE os.country_id = $4
    END;
`;
