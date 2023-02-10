"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveVotesQuery = void 0;
exports.saveVotesQuery = `
  UPDATE order_sets
  SET votes = $1
  WHERE order_set_id = $2;
`;
//# sourceMappingURL=save-votes-query.js.map