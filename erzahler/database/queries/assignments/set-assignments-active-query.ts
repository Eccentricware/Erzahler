export const setAssignmentsActiveQuery = `
  UPDATE assignments
  SET assignment_status = 'Active'
  WHERE game_id = $1
    AND assignment_type = 'Player'
    AND assignment_status IN ('Assigned', 'Locked');
`;