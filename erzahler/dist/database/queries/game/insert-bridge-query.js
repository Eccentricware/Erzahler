"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertBridgeQuery = void 0;
exports.insertBridgeQuery = `
  INSERT INTO bridges (
    points,
    start_province,
    end_province
  ) VALUES (
    $1,
    $2,
    $3
  );
`;
//# sourceMappingURL=insert-bridge-query.js.map