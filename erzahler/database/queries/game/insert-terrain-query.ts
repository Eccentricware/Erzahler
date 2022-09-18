export const insertTerrainQuery = `
  INSERT INTO terrain (
    province_id,
    bridge_start_province_id,
    bridge_end_province_id,
    terrain_type,
    render_category,
    points,
    top_bound,
    left_bound,
    right_bound,
    bottom_bound
  )
  SELECT
    p.province_id,
    s.province_id,
    e.province_id,
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7
  FROM provinces p
  INNER JOIN games g ON g.game_id = p.game_id
  LEFT JOIN provinces s ON s.game_id = g.game_id AND s.province_name = $8
  LEFT JOIN provinces e ON e.game_id = g.game_id AND e.province_name = $9
  WHERE g.game_name = $10
    AND p.province_name = $11;
`;