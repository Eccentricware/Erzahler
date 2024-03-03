export const getAdjNumsQuery = `
  WITH active_provinces AS (
    SELECT
      c.country_id,
      COUNT(c.country_id) active_provinces
    FROM get_last_province_history($1, $2) lph
    INNER JOIN countries c ON c.country_id = lph.controller_id
    WHERE lph.province_status = 'active'
    GROUP BY c.country_id
  ),
  bombarded_provinces AS (
    SELECT
      c.country_id,
      COUNT(c.country_id) bombarded_provinces
    FROM get_last_province_history($1, $2) lph
    INNER JOIN countries c ON c.country_id = lph.controller_id
    WHERE lph.province_status = 'bombarded'
    GROUP BY c.country_id
  ),
  unit_counts AS (
    SELECT
      u.country_id,
      COUNT(u.country_id) unit_counts
    FROM get_last_unit_history($1, $2) luh
    INNER JOIN units u ON u.unit_id = luh.unit_id
    INNER JOIN countries c ON c.country_id = u.country_id
    WHERE luh.unit_status = 'Active'
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
