export const createUserQuery = `
  INSERT INTO users (
    username,
    email,
    email_verified,
    verification_deadline,
    created_timestamp,
    last_sign_in_time
  ) VALUES (
    $1, $2, $3, $4, $5, $6
  );
`;