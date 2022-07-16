export const insertUnitHistoryQuery = `
  INSERT INTO unit_hitory(
    unit_id,
    turn_id,
    node_id,
    unit_status
  ) VALUES (
    $1,
    $2,
    $3,
    $4
  );
`;