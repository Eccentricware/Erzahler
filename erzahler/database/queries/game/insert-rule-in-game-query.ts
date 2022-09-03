export const insertRuleInGameQuery = `
  INSERT INTO rules_in_games (
    game_id,
    rule_id,
    rule_enabled
  ) VALUES (
    $1,
    $2,
    $3
  );
`;