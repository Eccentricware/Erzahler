export const checkEmailUnavailableQuery = `
  SELECT COUNT(email) as email_unavailable
  FROM players
  WHERE email = $1;
`;