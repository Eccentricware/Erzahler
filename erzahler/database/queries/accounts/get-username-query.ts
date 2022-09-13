export const getUsernameQuery = `
  SELECT user_id,
    username
  FROM users
  WHERE lower(username) = LOWER($1);
`;