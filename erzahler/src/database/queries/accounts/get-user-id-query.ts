export const getUserIdQuery = `
  SELECT user_id
  FROM users
  WHERE lower(username) = LOWER($1);
`;
