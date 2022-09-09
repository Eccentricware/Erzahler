export const insertTerrainQuery = `
  INSERT INTO terrain (
    province_id,
    terrain_type,
    render_category,
    points,
    bridge_start,
    bridge_end,
    top_bound,
    left_bound,
    right_bound,
    bottom_bound
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10
  );
`;