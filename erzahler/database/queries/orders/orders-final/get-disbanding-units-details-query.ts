export const getDisbandingUnitsDetailsQuery = `
  SELECT
    u.unit_id,
    u.unit_type,
    n.loc,
    p.province_name
  FROM order_sets os
  INNER JOIN units u ON u.unit_id = any(os.units_disbanding)
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  LEFT JOIN nodes n ON n.node_id = uh.node_id
  LEFT JOIN provinces p ON p.province_id = n.province_id
  WHERE uh.turn_id = $1
    AND os.turn_id = $2
    AND order_set_type = 'Orders'
    AND CASE WHEN 0 = $3 THEN true ELSE os.country_id = $3 END
`;