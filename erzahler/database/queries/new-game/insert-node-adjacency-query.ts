export const insertNodeAdjacencyQuery = `
  INSERT INTO node_adjacencies (
    node_1_id,
    node_2_id
  ) VALUES (
    $1,
    $2
  );
`;