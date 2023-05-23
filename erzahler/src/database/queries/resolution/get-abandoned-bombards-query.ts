export const getAbandonedBombardsQuery = `
  SELECT ph.province_id,
    ph.controller_id,
    ph.capital_owner_id,
    'active' as province_status,
    ph.valid_retreat,
    ph.vote_color,
    ph.status_color,
    ph.stroke_color
  FROM province_histories ph
  INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = ph.province_id
  INNER JOIN provinces p ON p.province_id = ph.province_id
  INNER JOIN nodes n ON n.province_id = p.province_id AND n.node_type = 'air'
  LEFT JOIN unit_histories uh ON uh.node_id = n.node_id
  LEFT JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = uh.unit_id
  LEFT JOIN units u ON u.unit_id = uh.unit_id
  WHERE ph.province_status = 'bombarded'
    AND (u.unit_id IS NULL OR u.country_id = ph.controller_id);
`;