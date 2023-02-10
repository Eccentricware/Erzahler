"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvincesByGameIdQuery = void 0;
exports.getProvincesByGameIdQuery = `
  SELECT province_id,
    province_name
  FROM provinces
  WHERE game_id = $1;
`;
//# sourceMappingURL=get-provinces-by-gameId.js.map