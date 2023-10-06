export const getTechTransferOrderQuery = `
  SELECT
    tt.tech_transfer_order_id,
    tt.order_set_id,
    c.country_id,
    c.country_name,
    tt.offering,
    tt.foreign_country_id,
    tt.foreign_country_name,
    tt.description,
    tt.resolution,
    tt.success
  FROM orders_transfer_tech tt
  INNER JOIN order_sets os ON os.order_set_id = tt.order_set_id
  INNER JOIN countries c ON c.country_id = os.country_id
  WHERE os.turn_id = $1
    AND CASE
      WHEN $2 = 0 THEN true
      ELSE os.country_id = $2
    END;
`;
