export const getGamesStartingQuery = `
  SELECT g.game_id,
    g.game_name,
    g.start_time,
    g.stylized_start_year,
    g.current_year,
    g.deadline_type,
    g.turn_1_timing,
    g.observe_dst,
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
    g.votes_span
  FROM games g
  WHERE g.game_status = 'Ready';
`;