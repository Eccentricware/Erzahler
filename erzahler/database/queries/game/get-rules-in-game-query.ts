export const getRulesInGameQuery = `
  SELECT rig.rule_name
    r.rule_key,
    rig.rule_description,
    r.rule_enabled
  FROM rules r
  INNER JOIN rules_in_games rig
  ON r.rule_id = rig.rule_id
  WHERE game_id = $1
`;