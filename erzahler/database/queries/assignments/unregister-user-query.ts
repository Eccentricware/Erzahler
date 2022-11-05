export const unregisterUserQuery = `
  UPDATE assignments
  SET country_id = NULL,
    assignment_end = NOW() AT TIME ZONE 'utc',
    assignment_status = 'Unregistered'
  WHERE user_id = $1
    AND game_id = $2
    AND assignment_type = $3;
`;