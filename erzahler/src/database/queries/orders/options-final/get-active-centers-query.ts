export const getActiveCountryCenters = `
  WITH last_province_history_index AS (
    SELECT ph.province_id,
      ph.turn_id,
      MAX(t.turn_number) AS turn_number
    FROM province_histories ph
    INNER JOIN turns t ON t.turn_id = ph.turn_id
    WHERE t.turn_number <= $1
    GROUP BY ph.province_id,
      ph.turn_id
  )
  SELECT p.province_name,
    n.node_id,
    n.loc
  FROM last_province_history_index lphi
  INNER JOIN province_histories ph ON ph.province_id = lphi.province_id AND ph.turn_id = lphi.turn_id
  INNER JOIN provinces p ON p.province_id = ph.province_id
  INNER JOIN nodes n ON n.province_id = p.province_id
  WHERE ph.controller_id = $2
    AND ph.province_status = 'active'
    AND n.node_type = 'land';
`;
