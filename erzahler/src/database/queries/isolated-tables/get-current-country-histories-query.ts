export const getCurrentCountryHistoriesQuery = `
  SELECT ch.country_id,
    ch.country_status,
    ch.city_count,
    ch.unit_count,
    ch.banked_builds,
    ch.nuke_range,
    ch.adjustments,
    ch.in_retreat,
    ch.vote_count,
    ch.nukes_in_production
  FROM country_histories ch
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = ch.country_id and lch.turn_id = ch.turn_id;
`;
