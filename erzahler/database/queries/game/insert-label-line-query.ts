export const insertLabelLineQuery = `
  INSERT INTO label_lines (
    province_id,
    label_line_name,
    x1,
    x2,
    y1,
    y2,
    stroke
  ) SELECT
    p.province_id,
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  FROM provinces p
  INNER JOIN games g ON g.game_id = p.game_id
  WHERE g.game_name = $7
    AND p.province_name = $8;
`;