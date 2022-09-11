export const insertNodeQuery = `
  INSERT INTO nodes (
    province_id,
    node_name,
    node_type,
    loc
  ) VALUES (
    $1,
    $2,
    $3,
    $4
  ) RETURNING
    node_id,
    node_name;
`;