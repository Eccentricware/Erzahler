export const insertNodeAdjacencyQuery = `
  INSERT INTO node_adjacencies (
    node_1_id,
    node_2_id
  )
  SELECT
    a.node_id as alpha_id,
    o.node_id as omega_id
  FROM games g
  INNER JOIN provinces ap ON ap.game_id = g.game_id
  INNER JOIN nodes a ON a.province_id = ap.province_id
  INNER JOIN provinces op ON op.game_id = g.game_id
  INNER JOIN nodes o ON o.province_id = op.province_id
  WHERE g.game_name = $1
    AND a.node_name = $2
    AND o.node_name = $3;
`;