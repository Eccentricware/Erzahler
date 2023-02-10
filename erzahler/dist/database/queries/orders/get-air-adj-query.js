"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAirAdjQuery = void 0;
exports.getAirAdjQuery = `
  SELECT node_id,
    adjacencies,
    province_name
  FROM get_air_adjacencies($1);
`;
//# sourceMappingURL=get-air-adj-query.js.map