export const insertBridgeQuery = `
  INSERT INTO bridges (
    points,
    start_province,
    end_province
  ) VALUES (
    $1,
    $2,
    $3
  );
`;
