"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDisbandOrdersQuery = void 0;
exports.saveDisbandOrdersQuery = `
  UPDATE order_sets
  SET units_disbanding = $1,
    increase_range = $2,
    nuke_locs = $3
  WHERE order_set_id = $4;
`;
//# sourceMappingURL=save-disband-orders-query.js.map