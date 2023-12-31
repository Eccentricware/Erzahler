export const updateBuildOrderSetQuery = `
  UPDATE order_sets
  SET increase_range = $1,
    default_orders = false,
    submission_time = NOW(),
    order_set_status = 'Submitted'
  WHERE order_set_id = $2;
`;

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

export const updateBuildOrderQuery = `
  UPDATE orders_adjustments
  SET build_type = $1,
    node_id = $2
  WHERE order_set_id = $3
    AND build_number = $4;
`;