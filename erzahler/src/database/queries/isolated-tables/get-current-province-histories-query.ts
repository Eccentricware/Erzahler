export const getCurrentProvinceHistoryQuery = `
  SELECT province_id,
    turn_id,
    controller_id,
    province_status,
    valid_retreat
  FROM get_last_province_history($1, $2);
`;
