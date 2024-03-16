export const getActiveCountryCenters = `
  SELECT p.province_name,
    n.node_id,
    n.loc
  FROM get_last_province_history($1, $2) lph
  INNER JOIN provinces p ON p.province_id = lph.province_id
  INNER JOIN nodes n ON n.province_id = p.province_id
  WHERE lph.controller_id = $3
    AND lph.province_status = 'active'
    AND n.node_type = 'land';
`;
