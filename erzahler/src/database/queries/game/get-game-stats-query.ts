export const getGameStatsQuery = `
  SELECT c.country_id,
    c.country_name,
    c.rank,
    lch.city_count,
    lch.vote_count,
    lch.banked_builds,
    lch.nuke_range,
    lch.adjustments,
    lch.country_status
  FROM get_last_country_history($1, $2) lch
  INNER JOIN countries c ON c.country_id = lch.country_id
  --WHERE lch.country_status IN ('Active', 'Civil Disorder')
  where c.rank != 'n'
  ORDER BY lch.country_status NOT IN ('Active', 'Civil Disorder'),
    c.rank,
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
