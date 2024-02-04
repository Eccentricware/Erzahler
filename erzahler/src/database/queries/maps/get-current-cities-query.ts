export const getCitiesQuery = `
  SELECT p.province_id,
    p.province_name,
    p.city_type,
    lph.province_status,
    lph.controller_id,
    p.capital_owner_id,
    lch.country_status capital_owner_status,
    p.city_loc
  FROM provinces p
  INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = p.province_id
  LEFT JOIN countries co ON co.country_id = lph.controller_id
  LEFT JOIN get_last_country_history($1, $2) lch ON lch.country_id = p.capital_owner_id
  WHERE p.city_type IS NOT NULL;
`;
