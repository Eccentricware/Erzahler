export const insertUnitQuery = `
  INSERT INTO units (
    country_id,
    unit_type
  ) VALUES (
    $1,
    $2
  )
`;