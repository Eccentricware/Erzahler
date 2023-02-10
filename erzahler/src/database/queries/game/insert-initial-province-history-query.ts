export const insertInitialProvinceHistoryQuery = `
  INSERT INTO province_histories (
    province_id,
    turn_id,
    controller_id,
    capital_owner_id,
    province_status,
    vote_color,
    status_color,
    stroke_color
  )
  SELECT
    p.province_id,
    t.turn_id,
    c.country_id,
    o.country_id,
    $1,
    $2,
    $3,
    $4
  FROM provinces p
  INNER JOIN games g ON g.game_id = p.game_id
  INNER JOIN turns t ON t.game_id = g.game_id
  LEFT JOIN countries c ON c.game_id = g.game_id AND c.country_name = $5
  LEFT JOIN countries o ON o.game_id = g.game_id AND o.country_name = $6
  WHERE g.game_name = $7
    AND t.turn_number = 0
    AND p.province_name = $8;
`;
