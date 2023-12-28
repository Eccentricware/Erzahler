export const insertBuildOrderQuery = `
  INSERT INTO order_adjustments (
    order_set_id,
    build_number
    build_type,
    node_id,
    order_status,
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  );
`;

export const saveBuildOrderQuery = `
  UPDATE order_adjustments
  SET build_type = $1,
    node_id = $2,
    destination_id = $3,
    order_status = $4
  WHERE order_set_id = $5
    AND build_number = $6;
`;