"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertProvinceQuery = void 0;
exports.insertProvinceQuery = `
  INSERT INTO provinces (
    game_id,
    province_name,
    province_fullname,
    province_type,
    vote_type,
    city_loc
  )
  SELECT
    game_id,
    $1,
    $2,
    $3,
    $4,
    $5
  FROM games
  WHERE game_name = $6
`;
//# sourceMappingURL=insert-province-query.js.map