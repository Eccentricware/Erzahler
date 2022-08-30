export const insertTurnQuery = `
  INSERT INTO turns (
    game_id,
    deadline,
    turn_number,
    turn_name,
    turn_type,
    turn_status
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  ) RETURNING turn_id;
`;