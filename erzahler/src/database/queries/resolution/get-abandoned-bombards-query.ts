export const getAbandonedBombardsQuery = `
  SELECT lph.province_id,
    lph.controller_id,
    p.capital_owner_id,
    'active' as province_status,
    lph.valid_retreat,
    lph.vote_color,
    lph.status_color,
    lph.stroke_color
  FROM get_last_province_history($1, $2) lph
  INNER JOIN provinces p ON p.province_id = lph.province_id
  INNER JOIN nodes n ON n.province_id = p.province_id AND n.node_type = 'air'
  LEFT JOIN get_last_unit_history($1, $2) luh ON luh.node_id = n.node_id
  LEFT JOIN units u ON u.unit_id = luh.unit_id
  WHERE lph.province_status = 'bombarded'
    AND (u.unit_id IS NULL OR u.country_id = lph.controller_id);
`;
