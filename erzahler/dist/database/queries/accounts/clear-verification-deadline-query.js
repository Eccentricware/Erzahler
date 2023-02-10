"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearVerficiationDeadlineQuery = void 0;
exports.clearVerficiationDeadlineQuery = `
  UPDATE providers
  SET verification_deadline = null
  WHERE uid = $1;
`;
//# sourceMappingURL=clear-verification-deadline-query.js.map