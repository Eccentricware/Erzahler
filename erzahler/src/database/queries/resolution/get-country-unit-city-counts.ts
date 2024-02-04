export const getCountryUnitCityCountsQuery = `
  WITH unit_counts AS (
    SELECT u.country_id,
      COUNT(u.unit_id) AS unit_count,
      lch.nukes_in_production
    FROM units u
    INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = u.unit_id
    INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = u.country_id
    WHERE luh.unit_status IN ('Active', 'Retreat')
    GROUP BY u.country_id,
      lch.nukes_in_production
  ), claiming_unit_count AS (
    SELECT u.country_id,
      COUNT(u.unit_id) AS claiming_unit_count
    FROM units u
    INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = u.unit_id
    WHERE luh.unit_status IN ('Active', 'Retreat')
      AND u.unit_type IN ('Army', 'Fleet')
    GROUP BY u.country_id
  ), city_counts AS (
    SELECT lph.controller_id,
      COUNT(lph.province_id) AS city_count
    FROM get_last_province_history($1, $2) lph
    WHERE lph.province_status = 'active'
    GROUP BY lph.controller_id
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
        (p.city_type = 'capital' AND lch.country_status = 'eliminated')
      )
    GROUP BY lph.controller_id
  ), occupying_country_id AS (
    SELECT p.capital_owner_id,
      lph.controller_id AS occupying_country_id
    FROM get_last_province_history($1, $2) lph
    INNER JOIN provinces p ON p.province_id = lph.province_id
    INNER JOIN countries c ON c.country_id = p.capital_owner_id
    WHERE p.city_type = 'capital' AND p.capital_owner_id = c.country_id
  )
  SELECT c.country_id,
    uc.unit_count + uc.nukes_in_production AS unit_count,
    CASE WHEN cc.city_count IS NULL THEN 0 ELSE cc.city_count END AS city_count,
    CASE
      WHEN vc.vote_count IS NULL AND lch.country_status = 'eliminated' THEN 0
      WHEN vc.vote_count IS NULL THEN 1
      ELSE vc.vote_count + 1
    END AS vote_count,
    oc.occupying_country_id,
    CASE
      WHEN cuc.claiming_unit_count > 0 THEN true
      ELSE false
    END AS can_claim_territory
  FROM countries c
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = c.country_id
  LEFT JOIN unit_counts uc ON uc.country_id = c.country_id
  LEFT JOIN city_counts cc ON cc.controller_id = c.country_id
  LEFT JOIN vote_counts vc ON vc.controller_id = c.country_id
  LEFT JOIN occupying_country_id oc ON oc.capital_owner_id = c.country_id
  LEFT JOIN claiming_unit_count cuc ON cuc.country_id = c.country_id
  WHERE c.game_id = $1
    AND c.rank != 'n'
    AND lch.country_status != 'eliminated'
  ORDER BY c.country_id;
`;
