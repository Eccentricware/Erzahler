"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertUnitQuery = void 0;
exports.insertUnitQuery = `
  INSERT INTO units (
    country_id,
    unit_name,
    unit_type
  )
  SELECT
    c.country_id,
    $1,
    $2
  FROM countries c
  INNER JOIN games g ON g.game_id = c.game_id
  INNER JOIN turns t ON t.game_id = g.game_id
  WHERE g.game_name = $3
    AND t.turn_number = 0
    AND c.country_name = $4
`;
//# sourceMappingURL=insert-unit-query.js.map