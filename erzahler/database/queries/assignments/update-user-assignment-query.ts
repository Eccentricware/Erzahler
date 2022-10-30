export const updateUserAssignmentQuery = `
  UPDATE assignments
  SET country_id = $1,
    assignment_end = $2,
    assignment_status = $3,
  WHERE user_id = $4,
    AND game_id = $5
    AND assignment_type = $6;
`;