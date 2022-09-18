export const insertLabelQuery = `
  INSERT INTO labels (
    province_id,
    label_name,
    label_type,
    loc,
    label_text,
    fill
  )
  SELECT
    p.province_id,
    $1,
    $2,
    $3,
    $4,
    $5
  FROM provinces p
  INNER JOIN games g ON g.game_id = p.game_id
  WHERE g.game_name = $6
    AND p.province_name = $7;
`;