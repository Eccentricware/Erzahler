export const getCurrentProvinceHistoryQuery = `
  SELECT ph.province_id,
    ph.turn_id,
    ph.controller_id,
    ph.province_status,
    ph.valid_retreat
  FROM province_histories ph
  INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = ph.province_id and lph.turn_id = ph.turn_id;
`;
