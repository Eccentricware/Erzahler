export const registerUserQuery = `
  INSERT INTO assignments (
    user_id,
    game_id,
    assignment_type,
    assignment_status,
    assignment_start
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    NOW() AT TIME ZONE 'utc'
  );
`;