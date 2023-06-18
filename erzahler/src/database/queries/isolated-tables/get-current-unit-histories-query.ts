export const getCurrentUnitHistoriesQuery = `
  SELECT uh.unit_history_id,
    uh.unit_id,
    uh.turn_id,
    uh.node_id,
    uh.unit_status
  FROM unit_histories uh
  INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = uh.unit_id;
`;
