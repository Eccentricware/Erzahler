export const insertCountryHistoryQuery = `
  INSERT INTO country_histories (
    country_id,
    turn_id,
    country_status,
    city_count,
    unit_count,
    banked_builds,
    nuke_range,
    adjustments
  )
  SELECT
    c.country_id,
    t.turn_id,
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  FROM countries c
  INNER JOIN games g ON g.game_id = c.game_id
  INNER JOIN turns t ON t.game_id = g.game_id
  WHERE g.game_name = $7
    AND t.turn_number = 0
    AND c.country_name = $8
`;