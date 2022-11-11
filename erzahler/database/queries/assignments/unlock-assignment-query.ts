export const unlockAssignmentQuery = `
  UPDATE assignments
  SET assignment_status = 'Assigned'
  WHERE game_id = $1
    AND user_id = $2
    AND assignment_type = 'Player';
`;