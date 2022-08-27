export const insertTerrainQuery = `
  INSERT INTO terrain (
    province_id,
    render_category,
    points,
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
    $7
  );
`;