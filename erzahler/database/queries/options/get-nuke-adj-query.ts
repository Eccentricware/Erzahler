export const getNukeAdjQuery = `
  SELECT node_id,
    adjacencies
  FROM get_node_adjacencies($1, true);
`;