export const getCitiesQuery = `
  SELECT p.province_id,
    p.province_name,
    p.city_type,
    ph.controller_id,
    p.capital_owner_id,
    coh.country_status capital_owner_status,
    p.city_loc,
    ph.province_status
  FROM provinces p
  INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = p.province_id
  INNER JOIN province_histories ph
    ON ph.province_id = p.province_id AND ph.turn_id = lph.turn_id
  LEFT JOIN countries co ON co.country_id = ph.controller_id
  LEFT JOIN get_last_country_history($1, $2) lch ON lch.country_id = p.capital_owner_id
  LEFT JOIN country_histories coh
    ON coh.country_id = lch.country_id AND coh.turn_id = lch.turn_id
  WHERE p.city_type IS NOT NULL;
`;
