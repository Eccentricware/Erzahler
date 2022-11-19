export const getUnresolvedDeadlinesQuery = `
  SELECT g.game_id,
    g.game_name,
    t.turn_name,
    t.deadline
  FROM games g
  INNER JOIN turns t ON t.game_id = g.game_id
  WHERE t.turn_status = 'Pending';
`;