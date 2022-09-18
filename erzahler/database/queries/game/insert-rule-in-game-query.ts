export const insertRuleInGameQuery = `
  INSERT INTO rules_in_games (
    game_id,
    rule_id,
    rule_enabled
  )
  SELECT
    $1,
    rule_id,
    $3
  FROM rules r
  WHERE r.rule_key = $2;
`;