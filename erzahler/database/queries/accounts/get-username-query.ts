export const getUsernameQuery = `
  SELECT
    username
  FROM users
  WHERE lower(username) = LOWER($1);
`;