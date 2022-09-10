export const insertProvinceQuery = `
  INSERT INTO provinces (
    game_id,
    province_name,
    province_fullname,
    province_type,
    vote_type,
    city_loc
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  ) RETURNING
    province_id,
    province_name;
`;