export const insertBuildOrderQuery = `
  INSERT INTO orders_adjustments (
    order_set_id,
    build_number,
    build_type,
    node_id
  ) VALUES (
    $1,
    $2,
    $3,
    $4
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