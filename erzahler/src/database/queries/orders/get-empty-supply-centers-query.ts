export const getEmptySupplyCentersQuery = `
  SELECT
    c.country_id,
    c.country_name,
    p.province_name,
    ln.node_id AS land_node_id,
    ln.loc AS land_node_loc,
    sn.node_id AS sea_node_id,
    sn.loc AS sea_node_loc,
    sn.node_name as sea_node_name,
    an.node_id AS air_node_id,
    an.loc AS air_node_loc
  FROM get_last_province_history($1, $2) lph
  INNER JOIN provinces p ON p.province_id = lph.province_id
  INNER JOIN province_histories ph ON ph.province_id = lph.province_id AND ph.turn_id = lph.turn_id
  INNER JOIN countries c ON c.country_id = ph.controller_id
  INNER JOIN country_histories ch ON ch.country_id = c.country_id
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = ch.country_id AND lch.turn_id = ch.turn_id
  LEFT JOIN nodes ln ON ln.province_id = p.province_id AND ln.node_type = 'land'
  LEFT JOIN nodes sn ON sn.province_id = p.province_id AND sn.node_type = 'sea'
  LEFT JOIN nodes an ON an.province_id = p.province_id AND an.node_type = 'air'
  LEFT JOIN get_last_unit_history($1, $2) luh
    ON luh.node_id = ln.node_id
      OR luh.node_id = sn.node_id
      OR luh.node_id = an.node_id
  WHERE p.game_id = $1
    AND ph.province_status = 'active'
    AND luh.unit_id IS NULL
    AND CASE WHEN $3 != 0 THEN c.country_id = $3 END
  ORDER BY
    c.country_name,
    p.province_name
`;
