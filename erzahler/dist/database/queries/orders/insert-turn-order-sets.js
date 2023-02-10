"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTurnOrderSetsQuery = void 0;
exports.insertTurnOrderSetsQuery = `
  INSERT INTO order_sets (
    country_id,
    turn_id,
    submission_time,
    order_set_type
  )
  SELECT c.country_id,
    $1,
    NOW() AT TIME ZONE 'utc',
    'Orders'
  FROM countries c
  INNER JOIN country_histories ch ON ch.country_id = c.country_id
  WHERE ch.country_status IN ('Active', 'Civil Disorder')
    AND ch.turn_id = $2
  RETURNING order_set_id,
    country_id;
`;
//# sourceMappingURL=insert-turn-order-sets.js.map