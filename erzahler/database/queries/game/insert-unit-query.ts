export const insertUnitQuery = `
  INSERT INTO units (
    country_id,
    unit_name,
    unit_type
  ) VALUES (
    $1,
    $2,
    $3
  ) RETURNING
    unit_id,
    unit_name;
`;