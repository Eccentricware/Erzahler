export const getTechOfferOptionsQuery = `
  SELECT
    c.country_id,
    c.country_name
  FROM games g
  INNER JOIN turns t ON t.game_id = g.game_id
  INNER JOIN get_last_country_history($1, $2) lch ON lch.turn_id = t.turn_id
  INNER JOIN countries c ON c.country_id = lch.country_id
  WHERE g.game_id = $1
    AND t.turn_number <= $2
    AND lch.country_status IN ('Active', 'Civil Disorder')
    AND lch.nuke_range IS NULL
  ORDER BY c.country_name;
`;
