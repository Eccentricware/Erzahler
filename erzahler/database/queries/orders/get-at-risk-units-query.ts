export const getAtRiskUnitsQuery = `
  SELECT c.country_id,
    c.country_name,
    c.rank,
    c.flag_key,
    u.unit_id,
    u.unit_type,
    p.province_name,
    n.loc
  FROM countries c
  INNER JOIN country_histories ch ON ch.country_id = c.country_id
  INNER JOIN units u ON u.country_id = c.country_id
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  WHERE uh.turn_id = $1
    AND ch.adjustments < 0
    AND CASE
      WHEN $2 != 0
      THEN c.country_id = $2
    END;
`;