"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountriesByGameIdQuery = void 0;
exports.getCountriesByGameIdQuery = `
  SELECT country_id,
    country_name
  FROM countries
  WHERE game_id = $1;
`;
//# sourceMappingURL=get-countries-by-gameId.js.map