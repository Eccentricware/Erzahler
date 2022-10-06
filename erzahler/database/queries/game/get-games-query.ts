export const getGamesQuery = `
  SELECT g.game_id,
    g.game_name,
    g.time_created,
    g.game_status,
    g.concurrent_games_limit,
    g.private_game,
    g.blind_administrators,
    g.deadline_type,
    g.fun_min,
    g.fun_max,
    g.skill_min,
    g.skill_max
  FROM games g
  WHERE g.game_status in ($1, $2, $3, $4, $5, $6)
  ORDER BY g.time_created;
`;