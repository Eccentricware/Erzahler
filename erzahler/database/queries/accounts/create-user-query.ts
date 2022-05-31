export const createUserQuery = `
  INSERT INTO users (
    username,
    verified,
    verification_deadline,
    created_timestamp,
    last_sign_in_time,
    user_status
  ) VALUES (
    $1, $2, $3, $4, $5, $6
  );
`;