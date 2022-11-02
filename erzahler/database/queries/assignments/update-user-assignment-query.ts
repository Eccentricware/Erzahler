export const updateUserAssignmentQuery = `
  UPDATE assignments
  SET country_id = $1,
    assignemnt_start = $2
    assignment_end = $3,
    assignment_status = $4,
  WHERE user_id = $5,
    AND game_id = $6
    AND assignment_type = $7;
`;