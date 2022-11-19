export interface ScheduleSettingsQueryResult {
  game_id: number;
	current_year: number;
	stylized_start_year: number;
	deadline_type: string;
	turn_1_timing: string;
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
}