export const reregisterUserQuery = `
  UPDATE assignments
  SET assignment_start = NOW() AT TIME ZONE 'utc',
    assignment_end = NULL,
    assignment_status = 'Registered'
  WHERE game_id = $1
    AND user_id = $2
    AND assignment_type = $3;
`;