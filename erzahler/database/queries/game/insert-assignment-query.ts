export const insertAssignmentQuery = `
  INSERT INTO assignments (
    user_id,
    game_id,
    country_id,
    assignment_type,
    assignment_start
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    CURRENT_TIMESTAMP
  );
`;