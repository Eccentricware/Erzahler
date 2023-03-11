export const getNominatableCountriesQuery = `
  SELECT
    c.country_id,
    c.country_name,
    c.rank
  FROM turns t
  INNER JOIN country_histories ch ON ch.turn_id = t.turn_id
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE t.turn_id = $1
    AND ch.country_status IN ('Active', 'Civil Disorder')
  ORDER BY c.country_name;
`;
