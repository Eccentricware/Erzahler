/**
 * This is deprecated with frontend reclaiming terrain styling logic
 */
export const getTerrainQuery = `
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
  INNER JOIN provinces p ON p.province_id = lph.province_id
  INNER JOIN terrain t ON t.province_id = p.province_id
  LEFT JOIN countries c ON c.country_id = lph.controller_id
  ORDER BY t.terrain_type DESC;
`;
