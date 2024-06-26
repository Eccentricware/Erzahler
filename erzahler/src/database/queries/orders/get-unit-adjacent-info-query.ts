/**
 * $1: game_id
 * $2: turn_number
 * $3: is_fall_turn
 * $4: is_retreat_turn
 */
export const getUnitAdjacentInfoQuery = `
  SELECT u.unit_id,
    u.unit_name,
    u.unit_type,
    luh.node_id,
    n.node_name,
    p.province_id,
    p.province_name,
    a.adjacencies,
    hs.hold_supports,
    tu.adjacent_transports,
    tt.adjacent_transportables,
    td.transport_destinations,
    lch.nuke_range
  FROM units u
  INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = luh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN turns t ON t.turn_id = luh.turn_id
  INNER JOIN countries c ON c.country_id = u.country_id
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = c.country_id
  LEFT JOIN get_node_adjacencies($1) a ON a.node_id = luh.node_id
  LEFT JOIN get_hold_supports($1, $2) hs ON hs.unit_id = u.unit_id
  LEFT JOIN get_adjacent_transports($1, $2) tu ON tu.unit_id = u.unit_id
  LEFT JOIN get_transport_destinations($1, $2) td ON td.unit_id = u.unit_id
  LEFT JOIN get_adjacent_transportables($1, $2) tt ON tt.unit_id = u.unit_id
  WHERE t.game_id = $1
    AND t.turn_number <= $2
    AND u.unit_type != 'Garrison'
    AND luh.unit_status = 'Active'
  ORDER BY u.unit_id;
`;
