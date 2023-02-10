"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTurnDefaultsPreparedQuery = void 0;
exports.setTurnDefaultsPreparedQuery = `
  UPDATE turns
  SET defaults_ready = true
  WHERE turn_id = $1;
`;
//# sourceMappingURL=set-turn-defaults-prepared-query.js.map