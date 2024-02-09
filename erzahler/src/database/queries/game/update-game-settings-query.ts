export const updateGameSettingsQuery = `
  UPDATE games
  SET game_name = $1,
    assignment_method = $2,
    stylized_start_year = $3,
    turn_1_timing = $4,
    deadline_type = $5,
    start_time = $6,
    observe_dst = $7,
    orders_day = $8,
    orders_time = $9,
    retreats_day = $10,
    retreats_time = $11,
    adjustments_day = $12,
    adjustments_time = $13,
    nominations_day = $14,
    nominations_time = $15,
    votes_day = $16,
    votes_time = $17,
    nmr_tolerance_total = $18,
    concurrent_games_limit = $19,
    private_game = $20,
    hidden_game = $21,
    blind_administrators = $22,
    final_readiness_check = $23,
    vote_delay_enabled = $24,
    partial_roster_start = $25,
    nomination_timing = $26,
    nomination_year = $27,
    automatic_assignments = $28,
    rating_limits_enabled = $29,
    fun_min = $30,
    fun_max = $31,
    skill_min = $32,
    skill_max = $33
  WHERE game_id = $34
`;

export const updateCoalitionScheduleQuery = `
  UPDATE coalition_schedules
  SET base_final = $1,
    penalty_a = $2,
    penalty_b = $3,
    penalty_c = $4,
    penalty_d = $5,
    penalty_e = $6,
    penalty_f = $7,
    penalty_g = $8
  WHERE game_id = $9;
`;
