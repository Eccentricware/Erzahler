export const getCountryStateQuery = `
  SELECT c.country_id,
    c.country_name,
    ch.in_retreat,
    ch.banked_builds,
    ch.nuke_range,
    ch.adjustments
  FROM country_histories ch
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE c.country_id = $1
  ORDER BY ch.turn_id DESC
  LIMIT 1;
`;