export const getGameStateQuery = `
  SELECT g.game_id,
    g.game_name,
    t.turn_id,
    t.deadline,
    t.turn_number,
    t.turn_name,
    t.turn_type,
    t.turn_status,
    t.resolved_time,
    t.deadline_missed,
    pt1.turn_id pending_turn_id,
    pt1.turn_type pending_turn_type,
    pt1.deadline pending_deadline,
    pt2.turn_id preliminary_turn_id,
    pt2.turn_type preliminary_turn_type,
    pt2.deadline preliminary_deadline,
    g.orders_day,
    g.orders_time,
    g.orders_span,
    g.retreats_day,
    g.retreats_time,
    g.retreats_span,
    g.adjustments_day,
    g.adjustments_time,
    g.adjustments_span,
    g.nominations_day,
    g.nominations_time,
    g.nominations_span,
    g.votes_day,
    g.votes_time,
    g.votes_span,
    g.nominate_during_adjustments,
    g.vote_during_spring,
    g.nomination_timing,
    g.nomination_year,
    t.year_number AS current_year, -- One of these id deprecated - g.current_year
    t.year_number,                 -- One of these id deprecated
    g.stylized_start_year,
    c.highest_ranked_req,
    c.all_votes_controlled,
    c.base_final,
    c.penalty_a,
    c.penalty_b,
    c.penalty_c,
    c.penalty_d,
    c.penalty_e,
    c.penalty_f,
    c.penalty_g,
    CASE
      WHEN uh.unit_status = 'Retreat'
      THEN true ELSE false
    END AS units_in_retreat,
    default_nuke_range
  FROM games g
  INNER JOIN turns t ON t.game_id = g.game_id
  INNER JOIN coalition_schedules c ON c.game_id = g.game_id
  LEFT JOIN unit_histories uh ON uh.turn_id = t.turn_id
  LEFT JOIN turns pt1 ON pt1.game_id = g.game_id AND pt1.turn_status = 'Pending'
  LEFT JOIN turns pt2 ON pt2.game_id = g.game_id AND pt2.turn_status = 'Preliminary'
  WHERE g.game_id = $1
    AND t.turn_status = 'Resolved'
  ORDER BY t.turn_number DESC,
    uh.unit_status DESC
  LIMIT 1;
`;
