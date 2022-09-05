export const insertProvinceHistoryQuery = `
  INSERT INTO province_history (
    province_id,
    turn_id,
    controller_id,
    capital_owner_id,
    province_status,
    vote_color,
    status_color,
    stroke_color
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8
  );
`;