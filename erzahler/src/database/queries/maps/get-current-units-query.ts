export const getUnitsQuery = `
  SELECT u.unit_name,
    u.unit_type,
    CASE
      WHEN luh.unit_status = 'Active' THEN n.loc
      ELSE en.loc
    END loc,
    c.flag_key,
    luh.unit_status
  FROM get_last_unit_history($1, $2) luh
  INNER JOIN units u ON u.unit_id = luh.unit_id
  INNER JOIN countries c ON c.country_id = u.country_id
  INNER JOIN nodes n ON n.node_id = luh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN games g ON g.game_id = p.game_id
  INNER JOIN nodes en ON en.province_id = p.province_id AND en.node_type = 'event'
  WHERE luh.unit_status IN ('Active', 'Retreat');
`;
