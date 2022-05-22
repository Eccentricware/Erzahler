export const getUserEmailQuery = `
  SELECT user_id,
    email
  FROM users
  WHERE email = $1;
`;