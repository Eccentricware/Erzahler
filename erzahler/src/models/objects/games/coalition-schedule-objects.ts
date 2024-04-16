export interface CoalitionScheduleResult {
  base_final: number;
  total_possible: number;
  penalty_a: number;
  penalty_b: number;
  penalty_c: number;
  penalty_d: number;
  penalty_e: number;
  penalty_f: number;
  penalty_g: number;
}

/**
 * This should be consolidated
 */
export interface CoalitionSchedule {
  baseFinal: number;
  baseRequired?: number;
  totalPossible: number;
  totalVotes?: number;
  penalties: Record<string, number>;
}
