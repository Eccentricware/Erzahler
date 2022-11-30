export const getGameStateQuery = `
  SELECT g.game_id,
    t.turn_id,
    t.deadline,
    t.turn_number,
    t.turn_name,
    t.turn_type,
    t.turn_status,
    t.resolved_time,
    t.deadline_missed,
    g.nominate_during_adjustments,
    g.vote_during_spring,
    g.nomination_timing,
    g.nomination_year,
    g.current_year,
    t.year_number
  FROM turns t
  INNER JOIN games g ON g.game_id = t.game_id
  WHERE g.game_id = $1
    AND t.turn_status = 'Resolved'
  ORDER BY turn_id DESC
  LIMIT 1;
`;