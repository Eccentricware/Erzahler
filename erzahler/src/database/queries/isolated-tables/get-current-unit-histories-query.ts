export const getCurrentUnitHistoriesQuery = `
  SELECT luh.unit_history_id,
    luh.unit_id,
    u.country_id,
    luh.turn_id,
    luh.node_id,
    luh.unit_status,
    n.node_name
  FROM get_last_unit_history($1, $2) luh
  INNER JOIN units u ON u.unit_id = luh.unit_id
  INNER JOIN nodes n ON n.node_id = luh.node_id;
`;
