/**
 * $1: game_id
 * $2: turn_number
 */
export const getRetreatingUnitAdjacentInfoQuery = `
  SELECT u.unit_id,
    u.unit_name,
    u.unit_type,
    luh.node_id,
    luh.displacer_province_id,
    n.node_name,
    p.province_id,
    p.province_name,
    a.adjacencies,
    hs.hold_supports as unit_presence
  FROM units u
  INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = luh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN turns t ON t.turn_id = luh.turn_id
  INNER JOIN countries c ON c.country_id = u.country_id
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = c.country_id
  INNER JOIN get_retreat_adjacencies($1, $2) a ON a.node_id = luh.node_id
  LEFT JOIN get_hold_supports($1, $2) hs ON hs.unit_id = u.unit_id
  WHERE t.game_id = $1
    AND t.turn_number <= $2
    AND u.unit_type != 'Garrison'
    AND luh.unit_status = 'Retreat'
  ORDER BY u.unit_id;
`;
