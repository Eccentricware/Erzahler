"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRulesInGameQuery = void 0;
exports.getRulesInGameQuery = `
	SELECT
    rig.game_id,
    r.rule_name,
    r.rule_key,
    r.rule_description,
    rig.rule_enabled
  FROM rules r
  INNER JOIN rules_in_games rig
  ON r.rule_id = rig.rule_id
  WHERE game_id = $1
`;
//# sourceMappingURL=get-rules-in-game-query.js.map