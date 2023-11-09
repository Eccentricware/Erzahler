export const getUserRegistrationsQuery = `
  SELECT u.user_id,
    u.username,
    a.assignment_id,
    a.assignment_type,
    a.assignment_status,
    a.assignment_start,
    a.assignment_end,
    a.country_id,
    g.game_id
  FROM users u
  INNER JOIN assignments a ON a.user_id = u.user_id
  INNER JOIN games g ON g.game_id = a.game_id
  WHERE g.game_id = $1
    AND CASE WHEN 0 = $2 THEN TRUE
      ELSE a.user_id = $2
    END
  ORDER BY a.assignment_type,
    u.username;
`;

export const getRegisteredPlayersQuery = `
  SELECT u.user_id,
    u.username,
    a.assignment_type,
    a.assignment_status
  FROM users u
  INNER JOIN assignments a ON a.user_id = u.user_id
  INNER JOIN games g ON g.game_id = a.game_id
  WHERE g.game_id = $1
    AND a.assignment_end IS NULL
  ORDER BY u.username;
`;

export const registerUserQuery = `
  INSERT INTO assignments (
    game_id,
    user_id,
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

export const unregisterUserQuery = `
  UPDATE assignments
  SET country_id = NULL,
    assignment_end = NOW() AT TIME ZONE 'utc',
    assignment_status = 'Unregistered'
  WHERE game_id = $1
    AND user_id = $2
    AND assignment_type = $3;
`;

export const reregisterUserQuery = `
  UPDATE assignments
  SET assignment_start = NOW() AT TIME ZONE 'utc',
    assignment_end = NULL,
    assignment_status = 'Registered'
  WHERE game_id = $1
    AND user_id = $2
    AND assignment_type = $3;
`;