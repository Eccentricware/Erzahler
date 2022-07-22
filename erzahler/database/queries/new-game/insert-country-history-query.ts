export const insertCountryHistoryQuery = `
  INSERT INTO country_history (
    country_id,
    turn_id,
    country_status,
    city_count,
    unit_count,
    banked_builds,
    nuke_range,
    adjustments
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