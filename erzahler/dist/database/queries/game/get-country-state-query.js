"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountryStateQuery = void 0;
exports.getCountryStateQuery = `
  SELECT c.country_id,
    c.country_name,
    ch.city_count,
    ch.unit_count,
    ch.in_retreat,
    ch.banked_builds,
    ch.nuke_range,
    ch.adjustments,
    ch.country_status,
    ch.nukes_in_production
  FROM country_histories ch
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE c.game_id = $1
    AND CASE WHEN $2 = 0 THEN true ELSE c.country_id = $2 END
  ORDER BY ch.turn_id DESC
  --LIMIT 1;
`;
//# sourceMappingURL=get-country-state-query.js.map