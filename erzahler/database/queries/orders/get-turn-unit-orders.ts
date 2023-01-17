export const getTurnUnitOrdersQuery = `
  SELECT o.order_id,
    o.order_set_id,
    o.order_type,
    o.ordered_unit_id,
    o.secondary_unit_id,
    o.destination_id,
    o.order_status
  FROM orders o
  INNER JOIN order_sets os ON os.order_set_id = o.order_set_id
  WHERE os.country_id = $1
    AND os.turn_id = $2
    AND os.order_set_type = 'Orders';
`;