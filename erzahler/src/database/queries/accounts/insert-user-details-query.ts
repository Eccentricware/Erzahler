export const insertUserDetailsQuery = `
  INSERT INTO user_details (
    user_id,
    user_status
  ) VALUES (
    $1,
    $2
  );
`;
