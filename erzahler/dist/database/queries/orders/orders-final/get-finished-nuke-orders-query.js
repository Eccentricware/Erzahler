"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinishedNukesOrdersQuery = void 0;
exports.getFinishedNukesOrdersQuery = `
  SELECT n.node_id,
    n.node_name,
    n.loc,
    p.province_name
  FROM order_sets os
  INNER JOIN nodes n ON n.node_id = any(os.nuke_locs)
  INNER JOIN provinces p ON p.province_id = n.province_id
  WHERE os.turn_id = $1
    AND os.country_id = $2;
`;
//# sourceMappingURL=get-finished-nuke-orders-query.js.map