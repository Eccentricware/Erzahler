"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransferValidationDataQuery = void 0;
exports.getTransferValidationDataQuery = `
  SELECT ch.country_id,
    c.country_name,
    ch.banked_builds,
    ch.nuke_range
  FROM country_histories ch
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE ch.turn_id = $1
    AND ch.country_status IN ('Active', 'Civil Disorder')
    AND c.rank != 'n';
`;
//# sourceMappingURL=get-transfer-validation-data-query.js.map