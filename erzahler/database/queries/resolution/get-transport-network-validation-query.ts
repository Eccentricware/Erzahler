export const getTransportNetworkValidation = `
  SELECT u.unit_id,
    tt.adjacent_transportables,
    tu.adjacent_transports,
    td.transport_destinations
  FROM units u
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN turns t ON t.turn_id = uh.turn_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  LEFT JOIN get_adjacent_transportables($1) tt ON tt.unit_id = u.unit_id
  LEFT JOIN get_adjacent_transports($1) tu ON tu.unit_id = u.unit_id
  LEFT JOIN get_transport_destinations($1) td ON td.unit_id = u.unit_id
  WHERE u.unit_type != 'Garrison'
    AND uh.unit_status = 'Active'
    AND t.turn_id = $1
    AND (
      tt.adjacent_transportables IS NOT NULL
      OR tu.adjacent_transports IS NOT NULL
      OR td.transport_destinations IS NOT NULL
    )
  ORDER BY u.unit_id;

`;