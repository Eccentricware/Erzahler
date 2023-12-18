export const insertProvinceQuery = `
  INSERT INTO provinces (
    game_id,
    province_name,
    province_fullname,
    province_type,
    city_type,
    city_loc,
    capital_owner_id
  )
  SELECT
    g.game_id,
    $1,
    $2,
    $3,
    $4,
    $5,
    c.country_id
  FROM games g
  LEFT JOIN countries c ON c.game_id = g.game_id AND c.country_name = $6
  WHERE game_name = $7;
`;
