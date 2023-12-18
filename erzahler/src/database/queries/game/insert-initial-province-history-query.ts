export const insertInitialProvinceHistoryQuery = `
  INSERT INTO province_histories (
    province_id,
    turn_id,
    controller_id,
    province_status
  )
  SELECT
    p.province_id,
    t.turn_id,
    c.country_id,
    $1
  FROM provinces p
  INNER JOIN games g ON g.game_id = p.game_id
  INNER JOIN turns t ON t.game_id = g.game_id
  LEFT JOIN countries c ON c.game_id = g.game_id AND c.country_name = $2
  WHERE g.game_name = $3
    AND t.turn_number = 0
    AND p.province_name = $4;
`;
