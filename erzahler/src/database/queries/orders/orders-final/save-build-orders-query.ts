export const saveBuildOrdersQuery = `
  UPDATE order_sets
  SET default_orders = false,
    submission_time = NOW(),
    build_locs = $1,
    build_tuples = $2,
    nuke_locs = $3,
    increase_range = $4
  WHERE order_set_id = $5;
`;
