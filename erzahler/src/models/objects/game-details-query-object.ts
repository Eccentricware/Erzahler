export interface GameDetailsQueryObject {
  game_id: number;
  game_name: string;
  time_created: Date;
  game_status: string;
  current_year: number;
  stylized_start_year: string;
  concurrent_games_limit: number;
  private_game: boolean;
  hidden_game: boolean;
  blind_administrators: boolean;
  assignment_method: string;
  deadline_type: string;
  meridiem_time: boolean;
  observe_dst: boolean;
  turn_1_timing: string;
  start_time: string;
  orders_day: string;
  orders_time: string;
  retreats_day: string;
  retreats_time: string;
  adjustments_day: string;
  adjustments_time: string;
  nominations_day: string;
  nominations_time: string;
  votes_day: string;
  votes_time: string;
  nmr_tolerance_total: number;
  nmr_tolerance_orders: number;
  nmr_tolerance_retreats: number;
  nmr_tolerance_adjustments: number;
  vote_delay_enabled: boolean;
  vote_delay_lock: number;
  vote_delay_percent: number;
  vote_delay_count: number;
  vote_delay_display_percent: number;
  vote_delay_display_count: number;
  partial_roster_start: boolean;
  final_readiness_check: boolean;
  nomination_timing: string;
  nomination_year: number;
  automatic_assignments: boolean;
  rating_limits_enabled: boolean;
  fun_min: number;
  fun_max: number;
  skill_min: number;
  skill_max: number;
  display_as_admin: boolean;
  base_final: number;
  total_possible: number;
  penalty_a: number;
  penalty_b: number;
  penalty_c: number;
  penalty_d: number;
  penalty_e: number;
  penalty_f: number;
  penalty_g: number;
  ready_time: string;
}
