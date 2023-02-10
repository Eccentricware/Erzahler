"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoalitionScheduleQuery = void 0;
exports.getCoalitionScheduleQuery = `
  SELECT
    base_final,
    penalty_a,
    penalty_b,
    penalty_c,
    penalty_d,
    penalty_e,
    penalty_f,
    penalty_g
  FROM coalition_schedules
  WHERE game_id = $1;
`;
//# sourceMappingURL=get-coalition-schedule-query.js.map