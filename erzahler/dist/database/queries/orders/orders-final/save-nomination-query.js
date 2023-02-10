"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveNominationQuery = void 0;
exports.saveNominationQuery = `
  UPDATE order_sets
  SET nomination = $1
  WHERE order_set_id = $2;
`;
//# sourceMappingURL=save-nomination-query.js.map