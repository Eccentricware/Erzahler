export const insertInitialUnitHistoryQuery = `
  INSERT INTO unit_histories(
    unit_id,
    turn_id,
    node_id,
    unit_status
  )
  SELECT
    u.unit_id,
    t.turn_id,
    n.node_id,
    $1
  FROM games g
  INNER JOIN turns t ON t.game_id = g.game_id
  INNER JOIN provinces p ON p.game_id = g.game_id
  INNER JOIN nodes n ON n.province_id = p.province_id
  INNER JOIN countries c ON c.game_id = g.game_id
  INNER JOIN units u ON u.country_id = c.country_id
  WHERE g.game_name = $2
    AND t.turn_number = 0
    AND u.unit_name = $3
    AND n.node_name = $4;
`;
