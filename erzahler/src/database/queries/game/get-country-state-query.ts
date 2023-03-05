export const getCountryStateQuery = `
  SELECT c.country_id,
    c.country_name,
    ch.city_count,
    ch.unit_count,
    ch.in_retreat,
    ch.banked_builds,
    ch.nuke_range,
    ch.adjustments,
    ch.country_status,
    ch.nukes_in_production
  FROM get_last_country_history($1, $2) lch
  INNER JOIN country_histories ch ON ch.country_id = lch.country_id AND ch.turn_id = lch.turn_id
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE CASE WHEN $3 = 0 THEN true ELSE c.country_id = $3 END;
`;
