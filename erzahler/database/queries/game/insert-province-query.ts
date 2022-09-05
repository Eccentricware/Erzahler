export const insertProvinceQuery = `
  INSERT INTO provinces (
    game_id,
    province_name,
    province_fullname,
    province_type,
    vote_type
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5
  ) RETURNING
    province_id,
    province_name;
`;