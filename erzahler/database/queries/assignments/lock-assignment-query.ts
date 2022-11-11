export const lockAssignmentQuery = `
  UPDATE assignments
  SET assignment_status = 'Locked'
  WHERE game_id = $1
    AND user_id = $2
    AND assignment_type = 'Player';
`;