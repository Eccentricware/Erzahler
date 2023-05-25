export const getAdjNumsQuery = `
  WITH active_provinces AS (
    SELECT
      c.country_id,
      COUNT(c.country_id) active_provinces
    FROM province_histories ph
    INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = ph.province_id
    INNER JOIN countries c ON c.country_id = ph.controller_id
    WHERE ph.province_status = 'active'
    GROUP BY c.country_id
  ),
  bombarded_provinces AS (
    SELECT
      c.country_id,
      COUNT(c.country_id) bombarded_provinces
    FROM province_histories ph
    INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = ph.province_id
    INNER JOIN countries c ON c.country_id = ph.controller_id
    WHERE ph.province_status = 'bombarded'
    GROUP BY c.country_id
  ),
  unit_counts AS (
    SELECT
      u.country_id,
      COUNT(u.country_id) unit_counts
    FROM unit_histories uh
    INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = uh.unit_id
    INNER JOIN units u ON u.unit_id = uh.unit_id
    INNER JOIN countries c ON c.country_id = u.country_id
    WHERE uh.unit_status = 'Active'
    GROUP BY u.country_id
  )
  SELECT c.country_id,
    ap.active_provinces,
    bp.bombarded_provinces,
    uc.unit_counts,
    ap.active_provinces - uc.unit_counts adjustments
  FROM countries c
  LEFT JOIN active_provinces ap ON ap.country_id = c.country_id
  LEFT JOIN bombarded_provinces bp ON bp.country_id = c.country_id
  LEFT JOIN unit_counts uc ON uc.country_id = c.country_id
  WHERE c.game_id = $1
  GROUP BY c.country_id,
    ap.active_provinces,
    bp.bombarded_provinces,
    uc.unit_counts
`;