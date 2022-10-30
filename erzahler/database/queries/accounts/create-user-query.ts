export const createUserQuery = `
  INSERT INTO users (
    username,
    username_locked,
    user_status,
    signup_time,
    last_sign_in_time,
    time_zone
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  );
`;