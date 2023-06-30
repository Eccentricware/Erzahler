export const getCountryUnitCityCountsQuery = `
  WITH unit_counts AS (
    SELECT u.country_id,
      COUNT(u.unit_id) AS unit_count
    FROM units u
    INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
    INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = uh.unit_id
    WHERE uh.unit_status IN ('Active', 'Retreat')
    GROUP BY u.country_id
  ), province_counts AS (
    SELECT ph.controller_id,
      COUNT(ph.province_id) AS province_count
    FROM province_histories ph
    INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = ph.province_id
    WHERE ph.province_status = 'active'
    GROUP BY ph.controller_id
  )
  SELECT c.country_id,
    uc.unit_count,
    pc.province_count
  FROM countries c
  INNER JOIN unit_counts uc ON uc.country_id = c.country_id
  INNER JOIN province_counts pc ON pc.controller_id = c.country_id;
`;