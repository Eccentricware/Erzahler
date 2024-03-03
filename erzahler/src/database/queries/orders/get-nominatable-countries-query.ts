export const getNominatableCountriesQuery = `
  SELECT
    c.country_id,
    c.country_name,
    c.rank
  FROM turns t
  INNER JOIN get_last_country_history($1, $2) lch ON lch.turn_id = t.turn_id
  INNER JOIN countries c ON c.country_id = lch.country_id
  WHERE t.game_id = $1
    AND t.turn_number <= $2
    AND lch.country_status IN ('Active', 'Civil Disorder')
  ORDER BY c.country_name;
`;
