export const getBuildTransferOrdersQuery = `
  SELECT tb.build_transfer_order_id,
    tb.order_set_id,
    c.country_id,
    c.country_name,
    tb.recipient_id,
    tb.recipient_name,
    tb.quantity,
    tb.ui_row
  FROM orders_transfer_builds tb
  INNER JOIN order_sets os ON os.order_set_id = tb.order_set_id
  INNER JOIN countries c ON c.country_id = os.country_id
  WHERE os.turn_id = $1
    AND CASE
      WHEN $2 = 0 then TRUE
      ELSE os.country_id = $2
    END
  ORDER BY tb.ui_row;
`;
