export const getCurrentCountryHistoriesQuery = `
  SELECT country_id,
    country_status,
    city_count,
    unit_count,
    banked_builds,
    nuke_range,
    adjustments,
    in_retreat,
    vote_count,
    nukes_in_production
  FROM get_last_country_history($1, $2);
`;
