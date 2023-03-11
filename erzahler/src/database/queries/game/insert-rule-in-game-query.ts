export const insertRuleInGameQuery = `
  INSERT INTO rules_in_games (
    game_id,
    rule_id,
    rule_enabled
  ) VALUES (
    (SELECT game_id
    FROM games
    WHERE game_name = $1),
    (SELECT rule_id
    FROM rules r
    WHERE r.rule_key = $2),
    $3
  )
`;
