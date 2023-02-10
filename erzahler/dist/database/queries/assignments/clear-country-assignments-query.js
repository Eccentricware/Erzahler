"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCountryAssignmentsQuery = void 0;
exports.clearCountryAssignmentsQuery = `
  UPDATE assignments
  SET country_id = NULL,
    assignment_status = 'Registered'
  WHERE game_id = $1
    AND country_id = $2;
`;
//# sourceMappingURL=clear-country-assignments-query.js.map