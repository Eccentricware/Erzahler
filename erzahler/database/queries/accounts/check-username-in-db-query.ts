export const checkUsernameInDBQuery = `
  SELECT COUNT(username) as username_exists
  FROM players
  WHERE username = $1;
`;