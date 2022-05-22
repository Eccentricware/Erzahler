export const getUserUsernameQuery = `
  SELECT user_id,
    username
  FROM users
  WHERE username = $1;
`;