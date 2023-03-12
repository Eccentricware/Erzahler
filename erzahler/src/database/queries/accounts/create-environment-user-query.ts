export const createEnvironmentUserQuery = `
  INSERT INTO users (
    user_id,
    username,
    username_locked,
    signup_time
  ) VALUES (
    $1,
    $2,
    $3,
    $4
  );
`;
