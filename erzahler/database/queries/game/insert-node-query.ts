export const insertNodeQuery = `
  INSERT INTO nodes (
    province_id,
    node_name,
    node_type,
    loc
  )
  SELECT
    p.province_id,
    $1,
    $2,
    $3
  FROM provinces p
  INNER JOIN games g ON g.game_id = p.game_id
  WHERE g.game_name = $4
    AND p.province_name = $5;
`;