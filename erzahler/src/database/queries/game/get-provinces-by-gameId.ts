export const getProvincesByGameIdQuery = `
  SELECT province_id,
    province_name
  FROM provinces
  WHERE game_id = $1;
`;
