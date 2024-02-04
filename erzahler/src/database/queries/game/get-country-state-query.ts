export const getCountryStateQuery = `
  SELECT c.country_id,
    c.country_name,
    lch.city_count,
    lch.unit_count,
    lch.vote_count,
    lch.in_retreat,
    lch.banked_builds,
    lch.nuke_range,
    lch.adjustments,
    lch.country_status,
    lch.nukes_in_production
  FROM countries c
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = c.country_id
  WHERE CASE WHEN $3 = 0 THEN true ELSE c.country_id = $3 END;
`;
