export const getAirAdjQuery = `
  SELECT node_id,
    adjacencies,
    province_name
  FROM get_node_adjacencies($1, true);
`;