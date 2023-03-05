export const getAtRiskUnitsQuery = `
  SELECT u.unit_id,
    u.unit_type,
    p.province_name,
    n.loc
  FROM get_last_country_history($1, $2) lch
  INNER JOIN country_histories ch ON ch.country_id = lch.country_id AND ch.turn_id = lch.turn_id
  INNER JOIN units u ON u.country_id = ch.country_id
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  WHERE ch.adjustments < 0
    AND CASE
      WHEN $3 != 0
      THEN ch.country_id = $3
    END
  ORDER BY p.province_name;
`;
