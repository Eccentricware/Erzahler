export const getRemainingGarrisonsQuery = `
  SELECT 0 order_id,
    'Hold' order_type,
    u.unit_id AS ordered_unit_id,
    true as valid,
    unit_type,
    unit_status,
    u.country_id,
    c.country_name country,
    uh.node_id,
    n.province_id,
    p.province_name province,
    p.province_type,
    p.vote_type,
    ph.province_status,
    ph.controller_id,
    capital_owner_id,
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
    NULL destination_vote_type,
    NULL destination_controller_id,
    NULL destination_capital_owner_id
  FROM get_last_unit_history($1, $2) luh
  INNER JOIN units u ON u.unit_id = luh.unit_id
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN province_histories ph ON ph.province_id = p.province_id
  INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = p.province_id
  INNER JOIN countries c ON c.country_id = u.country_id
  WHERE u.unit_type = 'Garrison'
    AND uh.unit_status = 'Active';
`;
