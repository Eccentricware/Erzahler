"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlayerSettings = void 0;
exports.updatePlayerSettings = `
  UPDATE users
  SET time_zone = $1,
    meridiem_time = $2
  WHERE user_id = $3;
`;
//# sourceMappingURL=update-user-query.js.map