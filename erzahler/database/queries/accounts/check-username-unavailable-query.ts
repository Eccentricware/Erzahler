export const checkUsernameUnavailableQuery = `
  SELECT COUNT(username) as username_unavailable
  FROM players
  WHERE username = $1;
`;