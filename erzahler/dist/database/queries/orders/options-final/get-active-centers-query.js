"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveCountryCenters = void 0;
exports.getActiveCountryCenters = `
  SELECT n.node_id,
    n.loc,
    p.province_name
  FROM nodes n
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN province_histories ph ON ph.province_id = p.province_id
  WHERE ph.turn_id = $1
    AND ph.controller_id = $2
    AND ph.province_status = 'active'
    AND n.node_type = 'land';
`;
//# sourceMappingURL=get-active-centers-query.js.map