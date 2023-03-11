export const getTechReceiveOptionsQuery = `
  SELECT
    c.country_id,
    c.country_name
  FROM games g
  INNER JOIN turns t ON t.game_id = g.game_id
  INNER JOIN country_histories ch ON ch.turn_id = t.turn_id
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE g.game_id = $1
    AND t.turn_id = $2
    AND ch.country_status IN ('Active', 'Civil Disorder')
    AND ch.nuke_range IS NOT NULL
  ORDER BY c.country_name;
`;
