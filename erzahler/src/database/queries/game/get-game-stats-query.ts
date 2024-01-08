export const getGameStatsQuery = `
  SELECT c.country_id,
    c.country_name,
    c.rank,
    ch.city_count,
    ch.vote_count,
    ch.banked_builds,
    ch.nuke_range,
    ch.adjustments
  FROM get_last_country_history($1, $2) lch
  INNER JOIN country_histories ch ON ch.country_id = lch.country_id AND ch.turn_id = lch.turn_id
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE ch.country_status IN ('Active', 'Civil Disorder')
  ORDER BY c.rank,
    c.country_name;
`;

export const getTurnHistoryQuery = `
  SELECT turn_id,
    game_id,
    turn_number,
    turn_name,
    turn_type,
    turn_status,
    deadline,
    resolved_time,
    deadline_missed
  FROM turns
  WHERE game_id = $1
    AND turn_status IN ('Resolved', 'Final')
  ORDER BY turn_number;
`;