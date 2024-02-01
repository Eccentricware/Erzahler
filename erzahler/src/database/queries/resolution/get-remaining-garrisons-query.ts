export const getRemainingGarrisonsQuery = `
  SELECT 0 order_id,
    0 order_set_id,
    'Hold' order_type,
    u.unit_id AS ordered_unit_id,
    true as valid,
    unit_type,
    luh.unit_status,
    u.country_id,
    c.country_name country,
    luh.node_id,
    n.province_id,
    p.province_name province,
    p.province_type,
    p.city_type,
    lph.province_status,
    lph.controller_id,
    p.capital_owner_id,
    NULL secondary_unit_id,
    NULL secondary_unit_type,
    NULL secondary_country_id,
    NULL secondary_country,
    NULL destination_id,
    NULL destination_node_type,
    NULL destination_province_id,
    NULL destination_province_name,
    NULL destination_province_status,
    NULL destination_province_type,
    NULL destination_city_type,
    NULL destination_controller_id,
    NULL destination_capital_owner_id
  FROM get_last_unit_history($1, $2) luh
  INNER JOIN units u ON u.unit_id = luh.unit_id
  INNER JOIN nodes n ON n.node_id = luh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = p.province_id
  INNER JOIN countries c ON c.country_id = u.country_id
  WHERE u.unit_type = 'Garrison'
    AND luh.unit_status = 'Active';
`;
