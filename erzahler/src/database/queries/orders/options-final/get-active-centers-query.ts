export const getActiveCountryCenters = `
  SELECT p.province_name,
    n.node_id,
    n.loc
  FROM get_last_province_history($1, $2) lph
  INNER JOIN province_histories ph ON ph.province_id = lph.province_id AND ph.turn_id = lph.turn_id
  INNER JOIN provinces p ON p.province_id = ph.province_id
  INNER JOIN nodes n ON n.province_id = p.province_id
  WHERE ph.controller_id = $3
    AND ph.province_status = 'active'
    AND n.node_type = 'land';
`;