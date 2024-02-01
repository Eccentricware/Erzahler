export const getCurrentUnitHistoriesQuery = `
  SELECT luh.unit_history_id,
    luh.unit_id,
    luh.turn_id,
    luh.node_id,
    luh.unit_status
  FROM get_last_unit_history($1, $2) luh;
`;
