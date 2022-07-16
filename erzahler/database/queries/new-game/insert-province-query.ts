export const insertProvinceQuery = `
  INSER INTO provinces (
    game_id,
    province_name,
    provice_fullname,
    province_type,
    vote_type
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5
  );
`;