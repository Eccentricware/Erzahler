export const insertNewUnitQuery = `
  INSERT INTO units (
    country_id,
    unit_type,
    unit_name
  ) VALUES (
    $1,
    $2,
    $3
  ) RETURNING
    unit_id AS unit_id;
`;

export const insertUnitHistoryQUery = `
  INSERT INTO unit_histories (
    unit_id,
    turn_id,
    node_id,
    unit_status
  ) VALUES (
    $1,
    $2,
    $3,
    'Active'
  );
`;