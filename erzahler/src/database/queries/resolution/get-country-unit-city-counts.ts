export const getCountryUnitCityCountsQuery = `
  WITH unit_counts AS (
    SELECT u.country_id,
      COUNT(u.unit_id) AS unit_count
    FROM units u
    INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
    INNER JOIN get_last_unit_history($1, $2) luh
      ON luh.unit_id = uh.unit_id AND luh.turn_id = uh.turn_id
    WHERE uh.unit_status IN ('Active', 'Retreat')
    GROUP BY u.country_id
  ), city_counts AS (
    SELECT ph.controller_id,
      COUNT(ph.province_id) AS city_count
    FROM province_histories ph
    INNER JOIN get_last_province_history($1, $2) lph
      ON lph.province_id = ph.province_id AND lph.turn_id = ph.turn_id
    WHERE ph.province_status = 'active'
    GROUP BY ph.controller_id
  ), vote_counts AS (
    SELECT lph.controller_id,
      COUNT(lph.province_id) AS vote_count
    FROM get_last_province_history($1, $2) lph
    INNER JOIN provinces p ON p.province_id = lph.province_id
    LEFT JOIN get_last_country_history($1, $2) lch ON lch.country_id = p.capital_owner_id
    WHERE lph.province_status IN ('active', 'bombarded', 'nuked')
      AND (
        p.city_type = 'vote'
          OR
        (p.city_type = 'capital' AND p.capital_owner_id = lph.controller_id)
          OR
        (p.city_type = 'capital' AND lch.country_status = 'eliminated')
      )
    GROUP BY lph.controller_id
  ), occupying_country_id AS (
    SELECT p.country_id,
      lph.controller_id AS occupying_country_id
    FROM get_last_province_history($1, $2) lph
    INNER JOIN provinces p ON p.province_id = lph.province_id
    WHERE p.city_type = 'capital' AND p.capital_owner_id = c.controller_id
  )
  SELECT c.country_id,
    uc.unit_count + lch.nukes_in_production AS unit_count,
    cc.city_count,
    cc.city_count - uc.unit_count - lch.nukes_in_production AS adjustments,
    vc.vote_count,
    oc.occupying_country_id
  FROM countries c
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = c.country_id
  INNER JOIN unit_counts uc ON uc.country_id = c.country_id
  INNER JOIN city_counts cc ON cc.controller_id = c.country_id
  INNER JOIN vote_counts vc ON vc.controller_id = c.country_id
  INNER JOIN occupying_country_id oc ON oc.country_id = c.country_id
  ORDER BY c.country_id;
`;
