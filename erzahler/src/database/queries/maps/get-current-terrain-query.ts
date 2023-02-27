export const getCurrentTerrainQuery = `
  SELECT
    p.province_name,
    t.render_category,
    t.terrain_type,
    t.top_bound,
    t.left_bound,
    t.right_bound,
    t.bottom_bound,
    c.color,
    t.points
  FROM get_last_province_history($1, $2) lph
  INNER JOIN province_histories ph ON ph.province_id = lph.province_id AND ph.turn_id = lph.turn_id
  INNER JOIN provinces p ON p.province_id = ph.province_id
  INNER JOIN terrain t ON t.province_id = p.province_id
  LEFT JOIN countries c ON c.country_id = ph.controller_id
  ORDER BY t.terrain_type DESC;
`;
