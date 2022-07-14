export const insertAssignmentsQuery = `
  INSERT INTO ASSIGNMENTS (
    user_id,
    game_id,
    country_id,
    assignment_type,
    assignment_start
  ) VALUES (
    $1,
    $2,
    NULL,
    'creator',
    CURRENT_TIMESTAMP
  );
`;