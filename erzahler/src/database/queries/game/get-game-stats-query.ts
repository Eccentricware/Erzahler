export const getGameStatsQuery = `
  SELECT c.country_id,
    c.country_name,
    c.rank,
    ch.city_count,
    ch.vote_count,
    ch.nuke_range,
    ch.adjustments
  FROM get_last_country_history($1, $2) lch
  INNER JOIN country_histories ch ON ch.country_id = lch.country_id AND ch.turn_id = lch.turn_id
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE ch.country_status IN ('Active', 'Civil Disorder')
  ORDER BY c.rank,
    c.country_name;
`;
