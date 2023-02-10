export const insertCountryQuery = `
  INSERT INTO countries (
    game_id,
    country_name,
    rank,
    color,
    flag_key
  )
  SELECT
    game_id,
    $1,
    $2,
    $3,
    $4
  FROM games
  WHERE game_name = $5;
`;
