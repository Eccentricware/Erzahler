export const createUserQuery = `
  INSERT INTO users (
    username,
    username_locked,
    user_status,
    email,
    email_verified,
    verification_deadline,
    signup_time,
    last_sign_in_time
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
  );
`;