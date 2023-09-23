// For first turn
export const insertTurnQuery = `
  INSERT INTO turns (
    game_id,
    deadline,
    turn_number,
    turn_name,
    turn_type,
    turn_status
  )
  SELECT
    g.game_id,
    $1,
    $2,
    $3,
    $4,
    $5
  FROM games g
  WHERE g.game_name = $6
`;

export const insertNextTurnQuery = `
  INSERT INTO turns (
    game_id,
    turn_number,
    turn_name,
    turn_type,
    turn_status,
    deadline
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  );
`;