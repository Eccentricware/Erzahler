export const insertNodeQuery = `
  INSERT INTO nodes (
    province_id,
    node_type,
    loc
  ) VALUES (
    $1,
    $2,
    $3
  );
`;