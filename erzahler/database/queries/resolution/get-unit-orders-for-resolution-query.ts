export const getUnitOrdersForResolutionQuery = `
  SELECT o.order_id,
    o.order_type,
    o.ordered_unit_id,
    u.unit_type,
    uh.unit_status,
    u.country_id country_id,
    c.country_name country,
    uh.node_id,
    p.province_name province,
    o.secondary_unit_id,
    su.country_id secondary_country_id,
    sc.country_name secondary_country,
    o.destination_id,
    o.valid,
    o.order_success,
    o.power,
    o.description,
    o.primary_resolution,
    o.secondary_resolution
  FROM order_sets os
  INNER JOIN orders o ON o.order_set_id = os.order_set_id
  INNER JOIN units u ON u.unit_id = o.ordered_unit_id
  INNER JOIN countries c ON c.country_id = u.country_id
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  LEFT JOIN units su ON su.unit_id = o.secondary_unit_id
  LEFT JOIN countries sc ON sc.country_id = su.country_id
  WHERE uh.turn_id = $1
    AND os.turn_id = $2
    AND os.order_set_type = 'Orders';
`;