export const getTurnUnitOrdersQuery = `
  SELECT
    o.order_id,
    o.order_set_id,
    o.ordered_unit_id,
    CASE
      WHEN luh.unit_status = 'Active' THEN un.loc
      ELSE ron.loc
    END ordered_unit_loc,
    o.order_type,
    o.secondary_unit_id,
    sn.loc secondary_unit_loc,
    o.destination_id,
    en.loc event_loc,
    o.order_status
  FROM orders o
  INNER JOIN order_sets os ON os.order_set_id = o.order_set_id
  INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = o.ordered_unit_id
  INNER JOIN nodes un ON un.node_id = luh.node_id
  INNER JOIN provinces up ON up.province_id = un.province_id
  INNER JOIN nodes ron ON ron.province_id = up.province_id AND ron.node_type = 'event'
  LEFT JOIN get_last_unit_history($1, $2) lsuh ON lsuh.unit_id = o.secondary_unit_id
  LEFT JOIN nodes sn ON sn.node_id = lsuh.node_id
  LEFT JOIN nodes dn ON dn.node_id = o.destination_id
  LEFT JOIN provinces dp ON dp.province_id = dn.province_id
  LEFT JOIN nodes en ON en.province_id = dp.province_id AND en.node_type = 'event'
  WHERE os.turn_id = $3
    AND os.order_set_type = 'Orders'
    AND CASE WHEN $4 = 0 THEN true ELSE os.country_id = $4 END;
`;
