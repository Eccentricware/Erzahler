export const getCurrentProvinceHistoryQuery = `
  SELECT lph.province_id,
    p.city_type,
    p.capital_owner_id,
    lch.country_status as capital_owner_status,
    lph.turn_id,
    lph.controller_id,
    lph.province_status,
    lph.valid_retreat
  FROM get_last_province_history($1, $2) lph
  INNER JOIN provinces p ON p.province_id = lph.province_id
  LEFT JOIN get_last_country_history($1, $2) lch ON lch.country_id = p.capital_owner_id;
`;
