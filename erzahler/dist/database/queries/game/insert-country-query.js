"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCountryQuery = void 0;
exports.insertCountryQuery = `
  INSERT INTO countries (
    game_id,
    country_name,
    rank,
    color,
    flag_key
  )
  SELECT
    game_id,
    $1,
    $2,
    $3,
    $4
  FROM games
  WHERE game_name = $5;
`;
//# sourceMappingURL=insert-country-query.js.map