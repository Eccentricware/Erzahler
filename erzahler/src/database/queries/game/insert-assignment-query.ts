export const insertAssignmentQuery = `
  INSERT INTO assignments (
    user_id,
    game_id,
    country_id,
    assignment_type,
    assignment_start
  )
  SELECT
    $1,
    g.game_id,
    $2,
    $3,
    NOW() AT TIME ZONE 'utc'
  FROM games g
  WHERE g.game_name = $4;
`;
