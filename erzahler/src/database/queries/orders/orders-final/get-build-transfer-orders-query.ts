export const getBuildTransferOrdersQuery = `
  SELECT
    ot.order_transfer_id,
    os.order_set_id,
    c.country_id,
    c.country_name,
    ot.foreign_country_id tech_partner_id,
    ot.foreign_country_name tech_partner_name,
    ot.quantity,
    ot.ui_row
  FROM orders_transfers ot
  INNER JOIN order_sets os ON os.order_set_id = ot.order_set_id
  INNER JOIN countries c ON c.country_id = os.country_id
  WHERE os.turn_id = $1
    AND os.country_id = $2
    AND ot.order_type = 1
  ORDER BY ot.ui_row;
`;
