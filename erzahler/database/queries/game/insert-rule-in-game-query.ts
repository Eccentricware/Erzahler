export const insertRuleInGameQuery = `
  INSERT INTO rules_in_games (
    game_id,
    rule_id,
    rule_enabled
  ) SELECT (
    $1,
    rules.rule_id,
    $2
  ) FROM rules
  WHERE
  rule_key = $3;
`;