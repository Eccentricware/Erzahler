export const clearCountryAssignmentsQuery = `
  UPDATE assignments
  SET country_id = NULL,
    assignment_status = 'Registered'
  WHERE game_id = $1
    AND country_id = $2;
`;
