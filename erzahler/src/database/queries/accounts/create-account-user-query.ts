export const createAccountUserQuery = `
  INSERT INTO users (
    username,
    username_locked,
    signup_time
  ) VALUES (
    $1,
    $2,
    $3
  ) RETURNING
    user_id,
    username,
    username_locked,
    signup_time;
`;
