export const getCountriesByGameIdQuery = `
  SELECT country_id,
    flag_key
  FROM countries
  WHERE game_id = $1;
`