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
    t.year_number,
    c.highest_ranked_req,
    c.all_votes_controlled,
    CASE
      WHEN uh.unit_status = 'retreating'
      THEN true ELSE false
    END AS units_in_retreat
  FROM games g
  INNER JOIN turns t ON t.game_id = g.game_id
  INNER JOIN coalition_schedules c ON c.game_id = g.game_id
  INNER JOIN unit_histories uh ON uh.turn_id = t.turn_id
  WHERE g.game_id = $1
    AND t.turn_status = 'Resolved'
  ORDER BY turn_id DESC,
    uh.unit_status DESC
  LIMIT 1;
`;