"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVotesOrdersQuery = void 0;
exports.getVotesOrdersQuery = `
  SELECT os.votes
  FROM order_sets os
  WHERE os.turn_id = $1
    AND os.country_id = $2;
`;
//# sourceMappingURL=get-votes-orders-query.js.map