"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveTransferOrdersQuery = void 0;
exports.saveTransferOrdersQuery = `
  UPDATE order_sets
  SET submission_time = NOW(),
    default_orders = false,
    tech_partner_id = $1,
    build_transfer_recipients = $2,
    build_transfer_tuples = $3
  WHERE order_set_id = $4;
`;
//# sourceMappingURL=save-transfer-orders-query.js.map