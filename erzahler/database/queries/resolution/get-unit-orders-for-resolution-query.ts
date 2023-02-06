export const getUnitOrdersForResolutionQuery = `
  SELECT o.order_id,
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
    uh.unit_status,
    u.country_id country_id,
    c.country_name country,
    uh.node_id,
    p.province_id,
    p.province_name province,
    p.province_type,
    p.vote_type,
    ph.province_status,
    ph.controller_id,
    ph.capital_owner_id,
    o.secondary_unit_id,
    su.unit_type secondary_unit_type,
    su.country_id secondary_country_id,
    sc.country_name secondary_country,
    o.destination_id,
    --dn.node_name destination_name,
    --dn.node_type destination_node_type,
    dn.province_id destination_province_id,
    dp.province_name destination_province_name,
    dph.province_status destination_province_status,
    dp.province_type destination_province_type,
    dp.vote_type destination_vote_type,
    dph.controller_id destination_controller_id,
    dph.capital_owner_id destination_capital_owner_id
  FROM order_sets os
  INNER JOIN orders o ON o.order_set_id = os.order_set_id
  INNER JOIN units u ON u.unit_id = o.ordered_unit_id
  INNER JOIN countries c ON c.country_id = u.country_id
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN province_histories ph ON ph.province_id = p.province_id
  LEFT JOIN nodes dn ON dn.node_id = o.destination_id
  LEFT JOIN provinces dp ON dp.province_id = dn.province_id
  LEFT JOIN province_histories dph ON dph.province_id = dp.province_id
  LEFT JOIN units su ON su.unit_id = o.secondary_unit_id
  LEFT JOIN countries sc ON sc.country_id = su.country_id
  LEFT JOIN unit_histories suh ON suh.unit_id = su.unit_id
  LEFT JOIN nodes sn ON sn.node_id = suh.node_id
  LEFT JOIN provinces sp ON sp.province_id = sn.node_id
  WHERE uh.turn_id = $1
    AND os.turn_id = $2
    AND os.order_set_type = 'Orders';
`;