export const getCurrentProvinceHistoryQuery = `
  SELECT lph.province_id,
    p.city_type,
    lph.turn_id,
    lph.controller_id,
    lph.province_status,
    lph.valid_retreat
  FROM get_last_province_history($1, $2) lph
  INNER JOIN provinces p ON p.province_id = lph.province_id;
`;
