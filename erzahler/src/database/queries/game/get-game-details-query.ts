export const getGameDetailsQuery = `
  SELECT g.game_id,
    g.game_name,
    g.time_created,
    g.game_status,
    g.current_year,
    g.stylized_start_year,
    g.concurrent_games_limit,
    g.private_game,
    g.hidden_game,
    g.blind_administrators,
    g.assignment_method,
    g.deadline_type,
    u.meridiem_time,
    g.observe_dst,
    g.turn_1_timing,
    g.start_time AT TIME ZONE $3 start_time,
    g.orders_day,
    g.orders_time AT TIME ZONE $3 orders_time,
    g.retreats_day,
    g.retreats_time AT TIME ZONE $3 retreats_time,
    g.adjustments_day,
    g.adjustments_time AT TIME ZONE $3 adjustments_time,
    g.nominations_day,
    g.nominations_time AT TIME ZONE $3 nominations_time,
    g.votes_day,
    g.votes_time AT TIME ZONE $3 votes_time,
    g.nmr_tolerance_total,
    g.nmr_tolerance_orders,
    g.nmr_tolerance_retreats,
    g.nmr_tolerance_adjustments,
    g.vote_delay_enabled,
    g.vote_delay_lock,
    g.vote_delay_percent,
    g.vote_delay_count,
    g.vote_delay_display_percent,
    g.vote_delay_display_count,
    g.partial_roster_start,
    g.final_readiness_check,
    g.nomination_timing,
    g.nomination_year,
    g.automatic_assignments,
    g.rating_limits_enabled,
    g.fun_min,
    g.fun_max,
    g.skill_min,
    g.skill_max,
    CASE
      WHEN (
        SELECT 1
        FROM assignments a
        WHERE a.game_id = $1
          and a.assignment_type IN ('Administrator', 'Creator')
          and a.user_id = $2
          and a.assignment_end IS NULL
      ) = 1
      THEN true
      ELSE false
    END display_as_admin
  FROM games g
  LEFT JOIN assignments a ON a.game_id = g.game_id
  LEFT JOIN users u ON u.user_id = a.user_id
  WHERE g.game_id = $1;
`;
