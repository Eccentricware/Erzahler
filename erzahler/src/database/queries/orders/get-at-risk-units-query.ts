export const getAtRiskUnitsQuery = `
  SELECT u.unit_id,
    u.country_id,
    u.unit_type,
    p.province_name,
    n.loc
  FROM get_last_country_history($1, $2) lch
  INNER JOIN units u ON u.country_id = lch.country_id
  INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = luh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  WHERE lch.adjustments < 0
    AND CASE
      WHEN $3 != 0 THEN lch.country_id = $3
      ELSE true
    END
  ORDER BY p.province_name;
`;
