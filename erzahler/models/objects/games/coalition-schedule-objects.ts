export interface CoalitionScheduleResult {
  base_final: number;
  penalty_a: number;
  penalty_b: number;
  penalty_c: number;
  penalty_d: number;
  penalty_e: number;
  penalty_f: number;
  penalty_g: number;
}

export interface CoalitionSchedule {
  baseFinal: number;
  penalties: Record<string, number>
}