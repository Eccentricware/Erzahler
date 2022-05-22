export const createUserQuery = `
  INSERT INTO users (
    username,
    firebase_uid,
    email,
    email_verified,
    signup_date
  ) VALUES (
    $1, $2, $3, $4, $5
  );
`;