export const getCitiesQuery = `
  SELECT
    p.vote_type,
    p.city_loc,
    ph.vote_color,
    ph.status_color,
    ph.stroke_color,
    ph.province_status,
    p.province_name
  FROM provinces p
  INNER JOIN games g ON g.game_id = p.game_id
  LEFT JOIN province_histories ph ON ph.province_id = p.province_id
  LEFT JOIN countries c ON c.country_id = ph.controller_id
  WHERE g.game_id = $1
    AND ph.turn_id = $2
    AND province_status IN ('active', 'dormant');
`;
