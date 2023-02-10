export const getCoalitionScheduleQuery = `
  SELECT
    base_final,
    penalty_a,
    penalty_b,
    penalty_c,
    penalty_d,
    penalty_e,
    penalty_f,
    penalty_g
  FROM coalition_schedules
  WHERE game_id = $1;
`;
