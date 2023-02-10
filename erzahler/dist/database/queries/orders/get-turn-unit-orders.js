"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTurnUnitOrdersQuery = void 0;
exports.getTurnUnitOrdersQuery = `
  SELECT
    o.order_id,
    o.order_set_id,
    o.ordered_unit_id,
    un.loc ordered_unit_loc,
    o.order_type,
    o.secondary_unit_id,
    sn.loc secondary_unit_loc,
    o.destination_id,
    en.loc event_loc,
    o.order_status
  FROM orders o
  INNER JOIN order_sets os ON os.order_set_id = o.order_set_id
  INNER JOIN unit_histories uh ON uh.unit_id = o.ordered_unit_id
  INNER JOIN nodes un ON un.node_id = uh.node_id
  LEFT JOIN unit_histories sh ON sh.unit_id = o.secondary_unit_id
  LEFT JOIN nodes sn ON sn.node_id = sh.node_id AND sh.turn_id = uh.turn_id
  LEFT JOIN nodes dn ON dn.node_id = o.destination_id
  LEFT JOIN provinces dp ON dp.province_id = dn.province_id
  LEFT JOIN nodes en ON en.province_id = dp.province_id AND en.node_type = 'event'
  WHERE CASE WHEN $1 = 0 THEN true ELSE os.country_id = $1 END
    AND os.turn_id = $2
    AND uh.turn_id = $3
    AND os.order_set_type = 'Orders';
`;
//# sourceMappingURL=get-turn-unit-orders.js.map