export const getScheduleSettingsQuery = `
  SELECT g.game_id,
    g.current_year,
    g.stylized_start_year,
    g.deadline_type,
    g.turn_1_timing,
    g.orders_day,
    g.orders_time,
    g.retreats_day,
    g.retreats_time,
    g.adjustments_day,
    g.adjustments_time,
    g.nominations_day,
    g.nominations_time,
    g.votes_day,
    g.votes_time
  FROM games g
  WHERE game_id = $1;
`;