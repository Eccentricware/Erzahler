export const getCitiesQuery = `
  SELECT p.province_id,
  p.province_name,
    p.vote_type,
    p.city_loc,
    ph.vote_color,
    ph.status_color,
    ph.stroke_color,
    ph.province_status
  FROM get_last_province_history($1, $2) lph
  INNER JOIN provinces p ON p.province_id = lph.province_id
  INNER JOIN province_histories ph ON ph.province_id = lph.province_id AND ph.turn_id = lph.turn_id
  WHERE ph.province_status IN ('active', 'dormant');
`;
