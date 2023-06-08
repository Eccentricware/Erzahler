export interface GameScheduleResult {
  game_id: number;
  current_year: number;
  stylized_start_year: number;
  deadline_type: string;
  turn_1_timing: string;
  observe_dst: boolean;
  orders_day: string;
  orders_time: string;
  orders_span: number;
  retreats_day: string;
  retreats_time: string;
  retreats_span: number;
  adjustments_day: string;
  adjustments_time: string;
  adjustments_span: number;
  nominations_day: string;
  nominations_time: string;
  nominations_span: number;
  votes_day: string;
  votes_time: string;
  votes_span: number;
}

export interface GameSchedule {
  gameId: number;
  currentYear: number;
  stylizedStartYear: number;
  deadlineType: string;
  turn1Timing: string;
  observeDst: boolean;
  ordersDay: string;
  ordersTime: string;
  ordersSpan: number;
  retreatsDay: string;
  retreatsTime: string;
  retreatsSpan: number;
  adjustmentsDay: string;
  adjustmentsTime: string;
  adjustmentsSpan: number;
  nominationsDay: string;
  nominationsTime: string;
  nominationsSpan: number;
  votesDay: string;
  votesTime: string;
  votesSpan: number;
}