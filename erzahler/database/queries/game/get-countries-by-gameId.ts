export const getCountriesByGameIdQuery = `
  SELECT country_id,
    country_name
  FROM countries
  WHERE game_id = $1;
`