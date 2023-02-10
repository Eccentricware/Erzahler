"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveBuildOrdersQuery = void 0;
exports.saveBuildOrdersQuery = `
  UPDATE order_sets
  SET default_orders = false,
    submission_time = NOW(),
    build_locs = $1,
    build_tuples = $2,
    nuke_locs = $3,
    increase_range = $4
  WHERE order_set_id = $5;
`;
//# sourceMappingURL=save-build-orders-query.js.map