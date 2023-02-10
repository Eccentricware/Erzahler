export const assignUserQuery = `
  UPDATE assignments
  SET country_id = $1,
    assignment_status = 'Assigned'
  WHERE game_id = $2
    AND user_id = $3
    AND assignment_type = 'Player';
`;
