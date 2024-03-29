export const getUnitOrdersForResolutionQuery = `
  SELECT o.order_id,
    o.order_set_id,
    o.order_type,
    o.ordered_unit_id,
    o.valid,
    --o.order_success,
    --CASE
    --  WHEN o.power IS NULL THEN 1
    --  ELSE o.power
    --END power,
    --o.description,
    --o.primary_resolution,
    --o.secondary_resolution,
    u.unit_type,
    luh.unit_status,
    u.country_id country_id,
    c.country_name country,
    luh.node_id,
    p.province_id,
    p.province_name province,
    p.province_type,
    en.node_id event_node_id,
    p.city_type,
    lph.province_status,
    lph.controller_id,
    p.capital_owner_id,
    o.secondary_unit_id,
    su.unit_type secondary_unit_type,
    su.country_id secondary_country_id,
    lsuh.unit_status secondary_unit_status,
    sc.country_name secondary_country,
    sp.province_name secondary_unit_province,
    --so.order_type secondary_unit_order_type,
    o.destination_id,
    dn.node_display destination_display,
    dn.node_type destination_node_type,
    dn.province_id destination_province_id,
    dp.province_name destination_province_name,
    ldph.province_status destination_province_status,
    dp.province_type destination_province_type,
    dp.city_type destination_city_type,
    ldph.controller_id destination_controller_id,
    dp.capital_owner_id destination_capital_owner_id
  FROM order_sets os
  INNER JOIN orders o ON o.order_set_id = os.order_set_id
  INNER JOIN units u ON u.unit_id = o.ordered_unit_id
  INNER JOIN countries c ON c.country_id = u.country_id
  INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = luh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = p.province_id
  INNER JOIN nodes en ON en.province_id = p.province_id AND en.node_type = 'event'
  LEFT JOIN nodes dn ON dn.node_id = o.destination_id
  LEFT JOIN provinces dp ON dp.province_id = dn.province_id
  LEFT JOIN get_last_province_history($1, $2) ldph ON ldph.province_id = dp.province_id
  LEFT JOIN units su ON su.unit_id = o.secondary_unit_id
  LEFT JOIN countries sc ON sc.country_id = su.country_id
  LEFT JOIN get_last_unit_history($1, $2) lsuh ON lsuh.unit_id = su.unit_id
  LEFT JOIN nodes sn ON sn.node_id = lsuh.node_id
  LEFT JOIN provinces sp ON sp.province_id = sn.province_id
  -- LEFT JOIN orders so ON so.ordered_unit_id = su.unit_id
  WHERE os.turn_id = $3
    AND os.order_set_type = 'Orders';
`;
