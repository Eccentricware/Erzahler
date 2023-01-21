export const getTerrainQuery = `
  SELECT
    t.render_category,
    t.terrain_type,
    t.top_bound,
    t.left_bound,
    t.right_bound,
    t.bottom_bound,
    c.color,
    t.points
  FROM terrain t
  INNER JOIN provinces p ON p.province_id = t.province_id
  INNER JOIN games g ON g.game_id = p.game_id
  LEFT JOIN province_histories ph ON ph.province_id = p.province_id
  LEFT JOIN countries c ON c.country_id = ph.controller_id
  WHERE g.game_id = $1
    AND ph.turn_id = $2
  ORDER BY t.terrain_type DESC;
`;