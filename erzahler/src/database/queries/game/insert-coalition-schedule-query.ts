export const insertCoalitionScheduleQuery = `
  INSERT INTO coalition_schedules (
    game_id,
    base_percent,
    base_adjust,
    base_final,
    penalty_a,
    penalty_b,
    penalty_c,
    penalty_d,
    penalty_e,
    penalty_f,
    penalty_g,
    total_possible,
    highest_ranked,
    highest_ranked_req
  )
  SELECT g.game_id,
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13
  FROM games g
  WHERE g.game_name = $14
`;
