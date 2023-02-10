"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertNodeQuery = void 0;
exports.insertNodeQuery = `
  INSERT INTO nodes (
    province_id,
    node_name,
    node_type,
    loc
  )
  SELECT
    p.province_id,
    $1,
    $2,
    $3
  FROM provinces p
  INNER JOIN games g ON g.game_id = p.game_id
  WHERE g.game_name = $4
    AND p.province_name = $5;
`;
//# sourceMappingURL=insert-node-query.js.map