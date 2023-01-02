export const getAirAdjQuery = `
  SELECT node_id,
    adjacencies,
    province_name
  FROM get_air_adjacencies($1);
`;