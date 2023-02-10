"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUnitOrderQuery = void 0;
exports.saveUnitOrderQuery = `
  UPDATE orders
  SET order_type = $1,
    secondary_unit_id = $2,
    destination_id = $3,
    order_status = $4
  WHERE order_set_id = $5
    AND ordered_unit_id = $6;
`;
//# sourceMappingURL=save-unit-order-query.js.map