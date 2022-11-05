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
    'Registered',
    NOW() AT TIME ZONE 'utc'
  );
`;